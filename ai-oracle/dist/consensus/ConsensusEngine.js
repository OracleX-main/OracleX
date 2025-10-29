"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusEngine = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class ConsensusEngine extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.activeConsensus = new Map();
        this.config = config;
    }
    async initialize() {
        logger_1.logger.info('🤝 Initializing Consensus Engine...');
        this.setupEventHandlers();
        logger_1.logger.info('✅ Consensus Engine initialized');
    }
    setupEventHandlers() {
        this.on('newAgentResponse', this.handleAgentResponse.bind(this));
        this.on('consensusTimeout', this.handleConsensusTimeout.bind(this));
    }
    async startConsensus(marketId, agentResponses) {
        logger_1.logger.info(`🎯 Starting consensus for market ${marketId} with ${agentResponses.length} agent responses`);
        const session = {
            marketId,
            agentResponses: [...agentResponses],
            startTime: Date.now(),
            isComplete: false,
            result: null
        };
        this.activeConsensus.set(marketId, session);
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Consensus timeout for market ${marketId}`));
                }, this.config.maxResolutionTime);
            });
            const consensusPromise = this.runConsensusAlgorithm(session);
            const result = await Promise.race([consensusPromise, timeoutPromise]);
            session.result = result;
            session.isComplete = true;
            logger_1.logger.info(`✅ Consensus reached for market ${marketId}: ${result.outcome} (${(result.confidence * 100).toFixed(1)}% confidence)`);
            this.emit('consensusReached', result);
            this.activeConsensus.delete(marketId);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Consensus failed for market ${marketId}:`, error);
            this.activeConsensus.delete(marketId);
            throw error;
        }
    }
    async runConsensusAlgorithm(session) {
        const { marketId, agentResponses } = session;
        if (agentResponses.length === 0) {
            throw new Error('No agent responses available for consensus');
        }
        if (agentResponses.length === 1) {
            return this.singleAgentConsensus(agentResponses[0], marketId);
        }
        const unanimousResult = this.checkUnanimousConsensus(agentResponses, marketId);
        if (unanimousResult) {
            return unanimousResult;
        }
        return this.weightedVotingConsensus(agentResponses, marketId);
    }
    singleAgentConsensus(response, marketId) {
        logger_1.logger.info(`🎯 Single agent consensus for market ${marketId}`);
        return {
            outcome: response.outcome,
            confidence: response.confidence * 0.7,
            evidence: response.reasoning,
            agentVotes: [{
                    agentId: response.agentId,
                    outcome: response.outcome,
                    weight: 1.0,
                    confidence: response.confidence
                }],
            consensusMethod: 'single_agent',
            timestamp: new Date()
        };
    }
    checkUnanimousConsensus(responses, marketId) {
        const outcomes = responses.map(r => r.outcome);
        const uniqueOutcomes = [...new Set(outcomes)];
        if (uniqueOutcomes.length === 1) {
            const outcome = uniqueOutcomes[0];
            const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
            if (avgConfidence >= 0.8) {
                logger_1.logger.info(`🎯 Unanimous consensus for market ${marketId}: ${outcome}`);
                return {
                    outcome,
                    confidence: Math.min(0.95, avgConfidence * 1.1),
                    evidence: this.combineEvidence(responses),
                    agentVotes: responses.map(r => ({
                        agentId: r.agentId,
                        outcome: r.outcome,
                        weight: this.calculateAgentWeight(r),
                        confidence: r.confidence
                    })),
                    consensusMethod: 'unanimous',
                    timestamp: new Date()
                };
            }
        }
        return null;
    }
    weightedVotingConsensus(responses, marketId) {
        logger_1.logger.info(`🎯 Weighted voting consensus for market ${marketId}`);
        const votes = responses.map(response => ({
            agentId: response.agentId,
            outcome: response.outcome,
            weight: this.calculateAgentWeight(response),
            confidence: response.confidence
        }));
        const outcomeGroups = votes.reduce((groups, vote) => {
            if (!groups[vote.outcome]) {
                groups[vote.outcome] = [];
            }
            groups[vote.outcome].push(vote);
            return groups;
        }, {});
        const outcomeScores = Object.entries(outcomeGroups).map(([outcome, outcomeVotes]) => {
            const totalWeight = outcomeVotes.reduce((sum, vote) => sum + vote.weight, 0);
            const avgConfidence = outcomeVotes.reduce((sum, vote) => sum + vote.confidence, 0) / outcomeVotes.length;
            const score = totalWeight * avgConfidence;
            return { outcome, score, totalWeight, avgConfidence, votes: outcomeVotes };
        });
        outcomeScores.sort((a, b) => b.score - a.score);
        const winningOutcome = outcomeScores[0];
        const totalScore = outcomeScores.reduce((sum, o) => sum + o.score, 0);
        const margin = totalScore > 0 ? winningOutcome.score / totalScore : 0;
        const confidence = this.calculateConsensusConfidence(winningOutcome.avgConfidence, margin, responses.length, outcomeScores.length);
        return {
            outcome: winningOutcome.outcome,
            confidence,
            evidence: this.combineEvidence(responses.filter(r => r.outcome === winningOutcome.outcome)),
            agentVotes: votes,
            consensusMethod: 'weighted_voting',
            timestamp: new Date()
        };
    }
    calculateAgentWeight(response) {
        const typeWeights = {
            'DATA_FETCHER': 0.8,
            'VALIDATOR': 1.0,
            'ARBITER': 1.2,
            'CONFIDENCE_SCORER': 0.9
        };
        const baseWeight = typeWeights[response.agentType] || 1.0;
        const confidenceBonus = response.confidence * 0.5;
        const timeBonus = response.processingTime < 5000 ? 0.1 : 0;
        return Math.max(0.1, Math.min(2.0, baseWeight + confidenceBonus + timeBonus));
    }
    calculateConsensusConfidence(avgConfidence, margin, agentCount, outcomeCount) {
        let confidence = avgConfidence;
        if (margin > 0.7) {
            confidence *= 1.1;
        }
        else if (margin < 0.4) {
            confidence *= 0.8;
        }
        const agentBonus = Math.min(0.1, (agentCount - 1) * 0.02);
        confidence += agentBonus;
        if (outcomeCount > 2) {
            confidence *= 0.9;
        }
        return Math.max(0.1, Math.min(0.95, confidence));
    }
    combineEvidence(responses) {
        const allEvidence = responses.flatMap(r => r.reasoning);
        const uniqueEvidence = [...new Set(allEvidence)];
        return uniqueEvidence.slice(0, 5);
    }
    handleAgentResponse(response) {
        logger_1.logger.info(`📥 Received agent response from ${response.agentId} for market`);
    }
    handleConsensusTimeout(marketId) {
        logger_1.logger.warn(`⏰ Consensus timeout for market ${marketId}`);
        const session = this.activeConsensus.get(marketId);
        if (session && !session.isComplete) {
            this.runConsensusAlgorithm(session)
                .then(result => {
                session.result = result;
                session.isComplete = true;
                this.emit('consensusReached', result);
            })
                .catch(error => {
                logger_1.logger.error(`Failed to force consensus for market ${marketId}:`, error);
            })
                .finally(() => {
                this.activeConsensus.delete(marketId);
            });
        }
    }
    getActiveConsensusCount() {
        return this.activeConsensus.size;
    }
    getConsensusStatus(marketId) {
        return this.activeConsensus.get(marketId) || null;
    }
    async cleanup() {
        logger_1.logger.info('🧹 Cleaning up Consensus Engine...');
        const activePromises = Array.from(this.activeConsensus.values())
            .filter(session => !session.isComplete)
            .map(session => new Promise(resolve => {
            const timeout = setTimeout(() => resolve(), 5000);
            if (session.result) {
                clearTimeout(timeout);
                resolve();
            }
        }));
        await Promise.allSettled(activePromises);
        this.activeConsensus.clear();
        this.removeAllListeners();
        logger_1.logger.info('✅ Consensus Engine cleanup completed');
    }
    async formConsensus(agentResponses, market) {
        const marketId = market?.id || 'unknown';
        return this.startConsensus(marketId, agentResponses);
    }
    getStatus() {
        return {
            active: true,
            consensusMethod: 'weighted_voting',
            averageConsensusTime: 0,
            totalConsensusReached: 0
        };
    }
}
exports.ConsensusEngine = ConsensusEngine;
//# sourceMappingURL=ConsensusEngine.js.map