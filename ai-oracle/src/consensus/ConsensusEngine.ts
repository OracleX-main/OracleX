import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { AgentResponse, ConsensusResult, AgentVote, OracleConfig } from '../types';

export class ConsensusEngine extends EventEmitter {
  private config: OracleConfig;
  private activeConsensus: Map<string, ConsensusSession> = new Map();

  constructor(config: OracleConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    logger.info('🤝 Initializing Consensus Engine...');
    this.setupEventHandlers();
    logger.info('✅ Consensus Engine initialized');
  }

  private setupEventHandlers(): void {
    this.on('newAgentResponse', this.handleAgentResponse.bind(this));
    this.on('consensusTimeout', this.handleConsensusTimeout.bind(this));
  }

  async startConsensus(marketId: string, agentResponses: AgentResponse[]): Promise<ConsensusResult> {
    logger.info(`🎯 Starting consensus for market ${marketId} with ${agentResponses.length} agent responses`);

    const session: ConsensusSession = {
      marketId,
      agentResponses: [...agentResponses],
      startTime: Date.now(),
      isComplete: false,
      result: null
    };

    this.activeConsensus.set(marketId, session);

    try {
      // Set timeout for consensus
      const timeoutPromise = new Promise<ConsensusResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Consensus timeout for market ${marketId}`));
        }, this.config.maxResolutionTime);
      });

      // Run consensus algorithm
      const consensusPromise = this.runConsensusAlgorithm(session);

      const result = await Promise.race([consensusPromise, timeoutPromise]);
      
      session.result = result;
      session.isComplete = true;

      logger.info(`✅ Consensus reached for market ${marketId}: ${result.outcome} (${(result.confidence * 100).toFixed(1)}% confidence)`);
      
      this.emit('consensusReached', result);
      this.activeConsensus.delete(marketId);

      return result;
    } catch (error) {
      logger.error(`❌ Consensus failed for market ${marketId}:`, error);
      this.activeConsensus.delete(marketId);
      throw error;
    }
  }

  private async runConsensusAlgorithm(session: ConsensusSession): Promise<ConsensusResult> {
    const { marketId, agentResponses } = session;

    // Apply different consensus methods based on the situation
    if (agentResponses.length === 0) {
      throw new Error('No agent responses available for consensus');
    }

    if (agentResponses.length === 1) {
      return this.singleAgentConsensus(agentResponses[0], marketId);
    }

    // Check for high confidence unanimous decision
    const unanimousResult = this.checkUnanimousConsensus(agentResponses, marketId);
    if (unanimousResult) {
      return unanimousResult;
    }

    // Use weighted voting consensus
    return this.weightedVotingConsensus(agentResponses, marketId);
  }

  private singleAgentConsensus(response: AgentResponse, marketId: string): ConsensusResult {
    logger.info(`🎯 Single agent consensus for market ${marketId}`);

    return {
      outcome: response.outcome,
      confidence: response.confidence * 0.7, // Reduce confidence for single agent
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

  private checkUnanimousConsensus(responses: AgentResponse[], marketId: string): ConsensusResult | null {
    const outcomes = responses.map(r => r.outcome);
    const uniqueOutcomes = [...new Set(outcomes)];

    // Check if all agents agree
    if (uniqueOutcomes.length === 1) {
      const outcome = uniqueOutcomes[0];
      const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
      
      // Only consider unanimous if average confidence is high
      if (avgConfidence >= 0.8) {
        logger.info(`🎯 Unanimous consensus for market ${marketId}: ${outcome}`);

        return {
          outcome,
          confidence: Math.min(0.95, avgConfidence * 1.1), // Boost confidence for unanimous decision
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

  private weightedVotingConsensus(responses: AgentResponse[], marketId: string): ConsensusResult {
    logger.info(`🎯 Weighted voting consensus for market ${marketId}`);

    // Calculate weights for each agent based on confidence and historical performance
    const votes: AgentVote[] = responses.map(response => ({
      agentId: response.agentId,
      outcome: response.outcome,
      weight: this.calculateAgentWeight(response),
      confidence: response.confidence
    }));

    // Group votes by outcome
    const outcomeGroups = votes.reduce((groups, vote) => {
      if (!groups[vote.outcome]) {
        groups[vote.outcome] = [];
      }
      groups[vote.outcome].push(vote);
      return groups;
    }, {} as Record<string, AgentVote[]>);

    // Calculate weighted scores for each outcome
    const outcomeScores = Object.entries(outcomeGroups).map(([outcome, outcomeVotes]) => {
      const totalWeight = outcomeVotes.reduce((sum, vote) => sum + vote.weight, 0);
      const avgConfidence = outcomeVotes.reduce((sum, vote) => sum + vote.confidence, 0) / outcomeVotes.length;
      const score = totalWeight * avgConfidence;

      return { outcome, score, totalWeight, avgConfidence, votes: outcomeVotes };
    });

    // Sort by score and get the winner
    outcomeScores.sort((a, b) => b.score - a.score);
    const winningOutcome = outcomeScores[0];

    // Calculate final confidence based on margin of victory and consensus
    const totalScore = outcomeScores.reduce((sum, o) => sum + o.score, 0);
    const margin = totalScore > 0 ? winningOutcome.score / totalScore : 0;
    
    const confidence = this.calculateConsensusConfidence(
      winningOutcome.avgConfidence,
      margin,
      responses.length,
      outcomeScores.length
    );

    return {
      outcome: winningOutcome.outcome,
      confidence,
      evidence: this.combineEvidence(responses.filter(r => r.outcome === winningOutcome.outcome)),
      agentVotes: votes,
      consensusMethod: 'weighted_voting',
      timestamp: new Date()
    };
  }

  private calculateAgentWeight(response: AgentResponse): number {
    // Base weight on agent type and confidence
    const typeWeights = {
      'DATA_FETCHER': 0.8,
      'VALIDATOR': 1.0,
      'ARBITER': 1.2,
      'CONFIDENCE_SCORER': 0.9
    };

    const baseWeight = typeWeights[response.agentType] || 1.0;
    const confidenceBonus = response.confidence * 0.5;
    
    // Processing time penalty (faster is generally better for responsiveness)
    const timeBonus = response.processingTime < 5000 ? 0.1 : 0;
    
    return Math.max(0.1, Math.min(2.0, baseWeight + confidenceBonus + timeBonus));
  }

  private calculateConsensusConfidence(
    avgConfidence: number,
    margin: number,
    agentCount: number,
    outcomeCount: number
  ): number {
    // Start with average agent confidence
    let confidence = avgConfidence;

    // Boost confidence for clear margin of victory
    if (margin > 0.7) {
      confidence *= 1.1;
    } else if (margin < 0.4) {
      confidence *= 0.8;
    }

    // Boost confidence for more agents (up to a point)
    const agentBonus = Math.min(0.1, (agentCount - 1) * 0.02);
    confidence += agentBonus;

    // Reduce confidence for too many different outcomes
    if (outcomeCount > 2) {
      confidence *= 0.9;
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private combineEvidence(responses: AgentResponse[]): string[] {
    const allEvidence = responses.flatMap(r => r.reasoning);
    
    // Remove duplicates and combine
    const uniqueEvidence = [...new Set(allEvidence)];
    
    // Limit to most important evidence points
    return uniqueEvidence.slice(0, 5);
  }

  private handleAgentResponse(response: AgentResponse): void {
    logger.info(`📥 Received agent response from ${response.agentId} for market`);
    // Could be used to dynamically update ongoing consensus if needed
  }

  private handleConsensusTimeout(marketId: string): void {
    logger.warn(`⏰ Consensus timeout for market ${marketId}`);
    const session = this.activeConsensus.get(marketId);
    
    if (session && !session.isComplete) {
      // Force consensus with available responses
      this.runConsensusAlgorithm(session)
        .then(result => {
          session.result = result;
          session.isComplete = true;
          this.emit('consensusReached', result);
        })
        .catch(error => {
          logger.error(`Failed to force consensus for market ${marketId}:`, error);
        })
        .finally(() => {
          this.activeConsensus.delete(marketId);
        });
    }
  }

  getActiveConsensusCount(): number {
    return this.activeConsensus.size;
  }

  getConsensusStatus(marketId: string): ConsensusSession | null {
    return this.activeConsensus.get(marketId) || null;
  }

  async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up Consensus Engine...');
    
    // Wait for ongoing consensus to complete or timeout
    const activePromises = Array.from(this.activeConsensus.values())
      .filter(session => !session.isComplete)
      .map(session => 
        new Promise<void>(resolve => {
          const timeout = setTimeout(() => resolve(), 5000); // 5 second cleanup timeout
          if (session.result) {
            clearTimeout(timeout);
            resolve();
          }
        })
      );

    await Promise.allSettled(activePromises);
    this.activeConsensus.clear();
    this.removeAllListeners();
    
    logger.info('✅ Consensus Engine cleanup completed');
  }

  // Additional methods for Oracle integration
  async formConsensus(agentResponses: AgentResponse[], market?: any): Promise<ConsensusResult> {
    const marketId = market?.id || 'unknown';
    return this.startConsensus(marketId, agentResponses);
  }

  getStatus(): any {
    return {
      active: true,
      consensusMethod: 'weighted_voting',
      averageConsensusTime: 0, // TODO: Track actual metrics
      totalConsensusReached: 0 // TODO: Track actual metrics
    };
  }
}

interface ConsensusSession {
  marketId: string;
  agentResponses: AgentResponse[];
  startTime: number;
  isComplete: boolean;
  result: ConsensusResult | null;
}