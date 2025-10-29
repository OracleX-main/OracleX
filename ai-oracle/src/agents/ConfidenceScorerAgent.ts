import { BaseAgent } from './BaseAgent';
import { AgentResponse, DataPoint, AgentType, Market } from '../types';
import { logger } from '../utils/logger';

export class ConfidenceScorerAgent extends BaseAgent {
  constructor() {
    super('confidence_scorer', AgentType.CONFIDENCE_SCORER, 'Confidence Scorer Agent', 'Scores confidence levels for predictions');
  }

  protected async onInitialize(): Promise<void> {
    logger.info('Confidence Scorer Agent initializing...');
  }

  protected async processData(data: DataPoint[], market: Market): Promise<{
    outcome: string;
    confidence: number;
    reasoning: string[];
    dataUsed: DataPoint[];
  }> {
    logger.info(`Confidence Scorer processing market ${market.id} with ${data.length} data points`);

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

  protected async onCleanup(): Promise<void> {
    logger.info('Confidence Scorer Agent cleaning up...');
  }

  private async analyzeConfidenceFactors(data: DataPoint[], market: Market): Promise<ConfidenceAnalysis> {
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

  private assessDataQuality(data: DataPoint[]): DataQualityScore {
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

    const factors: string[] = [];
    let score = 0.5; // Base score

    // Data volume factor
    if (data.length >= 10) {
      score += 0.1;
      factors.push('Sufficient data volume');
    } else if (data.length < 3) {
      score -= 0.2;
      factors.push('Limited data volume');
    }

    // Reliability factor
    if (avgReliability >= 0.8) {
      score += 0.2;
      factors.push('High source reliability');
    } else if (avgReliability < 0.5) {
      score -= 0.2;
      factors.push('Low source reliability');
    }

    // Freshness factor
    const freshnessRatio = recentData.length / data.length;
    if (freshnessRatio >= 0.7) {
      score += 0.1;
      factors.push('Recent data available');
    } else if (freshnessRatio < 0.3) {
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

  private assessSourceReliability(data: DataPoint[]): SourceReliabilityScore {
    const sources = [...new Set(data.map(point => point.source))];
    const sourceStats = sources.map(source => {
      const sourceData = data.filter(point => point.source === source);
      const avgReliability = sourceData.reduce((sum, point) => sum + point.reliability, 0) / sourceData.length;
      return { source, reliability: avgReliability, count: sourceData.length };
    });

    const avgSourceReliability = sourceStats.reduce((sum, stat) => sum + stat.reliability, 0) / sourceStats.length;
    
    let score = avgSourceReliability;
    const factors: string[] = [];

    // Source diversity factor
    if (sources.length >= 5) {
      score += 0.1;
      factors.push('High source diversity');
    } else if (sources.length < 2) {
      score -= 0.2;
      factors.push('Limited source diversity');
    }

    // High-reliability sources
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

  private assessTemporalFactors(data: DataPoint[], market: Market): TemporalScore {
    const now = Date.now();
    const marketDeadline = market.deadline.getTime();
    const timeToDeadline = marketDeadline - now;
    
    let score = 0.5;
    const factors: string[] = [];

    // Time to deadline factor
    const hoursToDeadline = timeToDeadline / (1000 * 60 * 60);
    if (hoursToDeadline > 168) { // More than a week
      score -= 0.1;
      factors.push('Deadline far in future');
    } else if (hoursToDeadline < 1) { // Less than an hour
      score += 0.2;
      factors.push('Deadline imminent - high certainty window');
    }

    // Data recency distribution
    const recentData = data.filter(point => (now - point.timestamp.getTime()) < 6 * 60 * 60 * 1000); // 6 hours
    const recentRatio = recentData.length / data.length;
    
    if (recentRatio >= 0.5) {
      score += 0.1;
      factors.push('Good recent data coverage');
    } else if (recentRatio < 0.2) {
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

  private assessConsensusFactors(data: DataPoint[]): ConsensusScore {
    if (data.length < 2) {
      return {
        score: 0.3,
        factors: ['Insufficient data for consensus analysis'],
        agreement: 0,
        variance: 1
      };
    }

    // Group by outcome/value
    const outcomeGroups = data.reduce((groups, point) => {
      const outcome = this.extractOutcome(point.value);
      if (!groups[outcome]) groups[outcome] = [];
      groups[outcome].push(point);
      return groups;
    }, {} as Record<string, DataPoint[]>);

    const outcomes = Object.keys(outcomeGroups);
    const largestGroup = Math.max(...Object.values(outcomeGroups).map(group => group.length));
    const agreement = largestGroup / data.length;

    let score = agreement;
    const factors: string[] = [];

    if (agreement >= 0.8) {
      score += 0.1;
      factors.push('Strong consensus');
    } else if (agreement < 0.5) {
      score -= 0.2;
      factors.push('Poor consensus');
    }

    // Outcome diversity
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

  private assessMarketFactors(market: Market): MarketScore {
    let score = 0.5;
    const factors: string[] = [];

    // Market category factor
    const complexCategories = ['crypto', 'sports', 'weather'];
    if (complexCategories.includes(market.category.toLowerCase())) {
      score -= 0.1;
      factors.push('Complex/volatile market category');
    }

    // Market age factor
    const marketAge = Date.now() - market.createdAt.getTime();
    const marketAgeHours = marketAge / (1000 * 60 * 60);
    
    if (marketAgeHours > 720) { // 30 days
      score += 0.1;
      factors.push('Mature market with historical data');
    } else if (marketAgeHours < 24) {
      score -= 0.1;
      factors.push('New market - limited history');
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      factors,
      marketAge: marketAgeHours
    };
  }

  private extractOutcome(value: any): string {
    if (typeof value === 'boolean') return value ? 'YES' : 'NO';
    if (typeof value === 'number') return value > 0.5 ? 'YES' : 'NO';
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized.includes('yes') || normalized.includes('true') || normalized.includes('positive')) return 'YES';
      if (normalized.includes('no') || normalized.includes('false') || normalized.includes('negative')) return 'NO';
    }
    return 'UNCERTAIN';
  }

  private calculateVariance(data: DataPoint[]): number {
    const numericValues = data
      .map(point => typeof point.value === 'number' ? point.value : null)
      .filter(val => val !== null) as number[];
    
    if (numericValues.length < 2) return 0;
    
    const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
    
    return variance;
  }

  private determineOutcome(analysis: ConfidenceAnalysis): string {
    // Get the most common outcome from data
    const outcomes = analysis.dataPoints.map(point => this.extractOutcome(point.value));
    const outcomeCount = outcomes.reduce((acc, outcome) => {
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedOutcomes = Object.entries(outcomeCount)
      .sort(([,a], [,b]) => b - a);
    
    return sortedOutcomes[0]?.[0] || 'UNCERTAIN';
  }

  private calculateOverallConfidence(analysis: ConfidenceAnalysis): number {
    const weights = {
      dataQuality: 0.25,
      sourceReliability: 0.25,
      temporalFactors: 0.15,
      consensusFactors: 0.25,
      marketFactors: 0.10
    };

    const weightedScore = 
      analysis.dataQuality.score * weights.dataQuality +
      analysis.sourceReliability.score * weights.sourceReliability +
      analysis.temporalFactors.score * weights.temporalFactors +
      analysis.consensusFactors.score * weights.consensusFactors +
      analysis.marketFactors.score * weights.marketFactors;

    return Math.max(0.1, Math.min(0.95, weightedScore));
  }

  private generateConfidenceReasoning(analysis: ConfidenceAnalysis): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Data Quality Score: ${(analysis.dataQuality.score * 100).toFixed(1)}%`);
    reasoning.push(`Source Reliability Score: ${(analysis.sourceReliability.score * 100).toFixed(1)}%`);
    reasoning.push(`Consensus Score: ${(analysis.consensusFactors.score * 100).toFixed(1)}%`);
    
    // Add key factors
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

interface ConfidenceAnalysis {
  dataQuality: DataQualityScore;
  sourceReliability: SourceReliabilityScore;
  temporalFactors: TemporalScore;
  consensusFactors: ConsensusScore;
  marketFactors: MarketScore;
  dataPoints: DataPoint[];
}

interface DataQualityScore {
  score: number;
  factors: string[];
  dataCount: number;
  avgReliability: number;
}

interface SourceReliabilityScore {
  score: number;
  factors: string[];
  sourceCount: number;
  avgReliability: number;
  sourceStats: Array<{ source: string; reliability: number; count: number }>;
}

interface TemporalScore {
  score: number;
  factors: string[];
  hoursToDeadline: number;
  recentDataRatio: number;
}

interface ConsensusScore {
  score: number;
  factors: string[];
  agreement: number;
  variance: number;
}

interface MarketScore {
  score: number;
  factors: string[];
  marketAge: number;
}