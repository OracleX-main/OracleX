"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfidenceScorerAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class ConfidenceScorerAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('confidence_scorer', types_1.AgentType.CONFIDENCE_SCORER, 'Confidence Scorer Agent', 'Scores confidence levels for predictions');
    }
    async onInitialize() {
        logger_1.logger.info('Confidence Scorer Agent initializing...');
    }
    async processData(data, market) {
        logger_1.logger.info(`Confidence Scorer processing market ${market.id} with ${data.length} data points`);
        const analysis = await this.analyzeConfidenceFactors(data, market);
        const outcome = this.determineOutcome(analysis);
        const confidence = this.calculateOverallConfidence(analysis);
        const reasoning = this.generateConfidenceReasoning(analysis);
        return {
            outcome,
            confidence,
            reasoning,
            dataUsed: data
        };
    }
    async onCleanup() {
        logger_1.logger.info('Confidence Scorer Agent cleaning up...');
    }
    async analyzeConfidenceFactors(data, market) {
        const dataQuality = this.assessDataQuality(data);
        const sourceReliability = this.assessSourceReliability(data);
        const temporalFactors = this.assessTemporalFactors(data, market);
        const consensusFactors = this.assessConsensusFactors(data);
        const marketFactors = this.assessMarketFactors(market);
        return {
            dataQuality,
            sourceReliability,
            temporalFactors,
            consensusFactors,
            marketFactors,
            dataPoints: data
        };
    }
    assessDataQuality(data) {
        if (data.length === 0) {
            return {
                score: 0,
                factors: ['No data available'],
                dataCount: 0,
                avgReliability: 0
            };
        }
        const avgReliability = data.reduce((sum, point) => sum + point.reliability, 0) / data.length;
        const recentData = data.filter(point => {
            const ageHours = (Date.now() - point.timestamp.getTime()) / (1000 * 60 * 60);
            return ageHours <= 24;
        });
        const factors = [];
        let score = 0.5;
        if (data.length >= 10) {
            score += 0.1;
            factors.push('Sufficient data volume');
        }
        else if (data.length < 3) {
            score -= 0.2;
            factors.push('Limited data volume');
        }
        if (avgReliability >= 0.8) {
            score += 0.2;
            factors.push('High source reliability');
        }
        else if (avgReliability < 0.5) {
            score -= 0.2;
            factors.push('Low source reliability');
        }
        const freshnessRatio = recentData.length / data.length;
        if (freshnessRatio >= 0.7) {
            score += 0.1;
            factors.push('Recent data available');
        }
        else if (freshnessRatio < 0.3) {
            score -= 0.1;
            factors.push('Stale data');
        }
        return {
            score: Math.max(0, Math.min(1, score)),
            factors,
            dataCount: data.length,
            avgReliability
        };
    }
    assessSourceReliability(data) {
        const sources = [...new Set(data.map(point => point.source))];
        const sourceStats = sources.map(source => {
            const sourceData = data.filter(point => point.source === source);
            const avgReliability = sourceData.reduce((sum, point) => sum + point.reliability, 0) / sourceData.length;
            return { source, reliability: avgReliability, count: sourceData.length };
        });
        const avgSourceReliability = sourceStats.reduce((sum, stat) => sum + stat.reliability, 0) / sourceStats.length;
        let score = avgSourceReliability;
        const factors = [];
        if (sources.length >= 5) {
            score += 0.1;
            factors.push('High source diversity');
        }
        else if (sources.length < 2) {
            score -= 0.2;
            factors.push('Limited source diversity');
        }
        const highReliabilitySources = sourceStats.filter(stat => stat.reliability >= 0.8).length;
        if (highReliabilitySources >= 3) {
            score += 0.1;
            factors.push('Multiple high-reliability sources');
        }
        return {
            score: Math.max(0, Math.min(1, score)),
            factors,
            sourceCount: sources.length,
            avgReliability: avgSourceReliability,
            sourceStats
        };
    }
    assessTemporalFactors(data, market) {
        const now = Date.now();
        const marketDeadline = market.deadline.getTime();
        const timeToDeadline = marketDeadline - now;
        let score = 0.5;
        const factors = [];
        const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);
        if (hoursToDeadline > 168) {
            score -= 0.1;
            factors.push('Deadline far in future');
        }
        else if (hoursToDeadline < 1) {
            score += 0.2;
            factors.push('Deadline imminent - high certainty window');
        }
        const recentData = data.filter(point => (now - point.timestamp.getTime()) < 6 * 60 * 60 * 1000);
        const recentRatio = recentData.length / data.length;
        if (recentRatio >= 0.5) {
            score += 0.1;
            factors.push('Good recent data coverage');
        }
        else if (recentRatio < 0.2) {
            score -= 0.1;
            factors.push('Limited recent data');
        }
        return {
            score: Math.max(0, Math.min(1, score)),
            factors,
            hoursToDeadline,
            recentDataRatio: recentRatio
        };
    }
    assessConsensusFactors(data) {
        if (data.length < 2) {
            return {
                score: 0.3,
                factors: ['Insufficient data for consensus analysis'],
                agreement: 0,
                variance: 1
            };
        }
        const outcomeGroups = data.reduce((groups, point) => {
            const outcome = this.extractOutcome(point.value);
            if (!groups[outcome])
                groups[outcome] = [];
            groups[outcome].push(point);
            return groups;
        }, {});
        const outcomes = Object.keys(outcomeGroups);
        const largestGroup = Math.max(...Object.values(outcomeGroups).map(group => group.length));
        const agreement = largestGroup / data.length;
        let score = agreement;
        const factors = [];
        if (agreement >= 0.8) {
            score += 0.1;
            factors.push('Strong consensus');
        }
        else if (agreement < 0.5) {
            score -= 0.2;
            factors.push('Poor consensus');
        }
        if (outcomes.length > 3) {
            score -= 0.1;
            factors.push('High outcome diversity');
        }
        const variance = this.calculateVariance(data);
        return {
            score: Math.max(0, Math.min(1, score)),
            factors,
            agreement,
            variance
        };
    }
    assessMarketFactors(market) {
        let score = 0.5;
        const factors = [];
        const complexCategories = ['crypto', 'sports', 'weather'];
        if (complexCategories.includes(market.category.toLowerCase())) {
            score -= 0.1;
            factors.push('Complex/volatile market category');
        }
        const marketAge = Date.now() - market.createdAt.getTime();
        const marketAgeHours = marketAge / (1000 * 60 * 60);
        if (marketAgeHours > 720) {
            score += 0.1;
            factors.push('Mature market with historical data');
        }
        else if (marketAgeHours < 24) {
            score -= 0.1;
            factors.push('New market - limited history');
        }
        return {
            score: Math.max(0, Math.min(1, score)),
            factors,
            marketAge: marketAgeHours
        };
    }
    extractOutcome(value) {
        if (typeof value === 'boolean')
            return value ? 'YES' : 'NO';
        if (typeof value === 'number')
            return value > 0.5 ? 'YES' : 'NO';
        if (typeof value === 'string') {
            const normalized = value.toLowerCase().trim();
            if (normalized.includes('yes') || normalized.includes('true') || normalized.includes('positive'))
                return 'YES';
            if (normalized.includes('no') || normalized.includes('false') || normalized.includes('negative'))
                return 'NO';
        }
        return 'UNCERTAIN';
    }
    calculateVariance(data) {
        const numericValues = data
            .map(point => typeof point.value === 'number' ? point.value : null)
            .filter(val => val !== null);
        if (numericValues.length < 2)
            return 0;
        const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
        return variance;
    }
    determineOutcome(analysis) {
        const outcomes = analysis.dataPoints.map(point => this.extractOutcome(point.value));
        const outcomeCount = outcomes.reduce((acc, outcome) => {
            acc[outcome] = (acc[outcome] || 0) + 1;
            return acc;
        }, {});
        const sortedOutcomes = Object.entries(outcomeCount)
            .sort(([, a], [, b]) => b - a);
        return sortedOutcomes[0]?.[0] || 'UNCERTAIN';
    }
    calculateOverallConfidence(analysis) {
        const weights = {
            dataQuality: 0.25,
            sourceReliability: 0.25,
            temporalFactors: 0.15,
            consensusFactors: 0.25,
            marketFactors: 0.10
        };
        const weightedScore = analysis.dataQuality.score * weights.dataQuality +
            analysis.sourceReliability.score * weights.sourceReliability +
            analysis.temporalFactors.score * weights.temporalFactors +
            analysis.consensusFactors.score * weights.consensusFactors +
            analysis.marketFactors.score * weights.marketFactors;
        return Math.max(0.1, Math.min(0.95, weightedScore));
    }
    generateConfidenceReasoning(analysis) {
        const reasoning = [];
        reasoning.push(`Data Quality Score: ${(analysis.dataQuality.score * 100).toFixed(1)}%`);
        reasoning.push(`Source Reliability Score: ${(analysis.sourceReliability.score * 100).toFixed(1)}%`);
        reasoning.push(`Consensus Score: ${(analysis.consensusFactors.score * 100).toFixed(1)}%`);
        const allFactors = [
            ...analysis.dataQuality.factors,
            ...analysis.sourceReliability.factors,
            ...analysis.temporalFactors.factors,
            ...analysis.consensusFactors.factors,
            ...analysis.marketFactors.factors
        ];
        reasoning.push(`Key factors: ${allFactors.slice(0, 3).join(', ')}`);
        return reasoning;
    }
}
exports.ConfidenceScorerAgent = ConfidenceScorerAgent;
//# sourceMappingURL=ConfidenceScorerAgent.js.map