import { BaseAgent } from './BaseAgent';
import { AgentResponse, DataPoint, AgentType, Market } from '../types';
import { logger } from '../utils/logger';

export class ValidatorAgent extends BaseAgent {
  constructor() {
    super('validator', AgentType.VALIDATOR, 'Validator Agent', 'Validates data quality and consistency');
  }

  protected async onInitialize(): Promise<void> {
    logger.info('Validator Agent initializing...');
    // Initialize validation parameters or external connections if needed
  }

  protected async processData(data: DataPoint[], market: Market): Promise<{
    outcome: string;
    confidence: number;
    reasoning: string[];
    dataUsed: DataPoint[];
  }> {
    logger.info(`Validator processing market ${market.id} with ${data.length} data points`);

    // Validate data quality and consistency
    const validationResults = await this.validateData(data);
    const outcome = this.determineOutcome(validationResults);
    const confidence = this.calculateConfidence(validationResults);
    const reasoning = this.generateReasoning(validationResults);

    return {
      outcome,
      confidence,
      reasoning,
      dataUsed: data
    };
  }

  protected async onCleanup(): Promise<void> {
    logger.info('Validator Agent cleaning up...');
    // Cleanup resources if needed
  }

  async processMarket(marketId: string, data: DataPoint[]): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      logger.info(`Validator processing market ${marketId} with ${data.length} data points`);

      // Create a mock market for compatibility
      const market: Market = {
        id: marketId,
        question: 'Unknown Market',
        category: 'general',
        outcomes: ['YES', 'NO'],
        deadline: new Date(),
        createdAt: new Date(),
        creator: 'system',
        totalStake: 0,
        status: 'ACTIVE' as any
      };

      const result = await this.processData(data, market);

      const response: AgentResponse = {
        agentId: this.getId(),
        agentType: this.getType(),
        outcome: result.outcome,
        confidence: result.confidence,
        reasoning: result.reasoning,
        dataUsed: result.dataUsed,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      };

      this.emit('responseGenerated', response);
      logger.info(`Validator completed processing for market ${marketId}`);

      return response;
    } catch (error) {
      logger.error(`Validator failed to process market ${marketId}:`, error);
      throw error;
    }
  }

  private async validateData(data: DataPoint[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const point of data) {
      const result: ValidationResult = {
        dataPoint: point,
        isValid: true,
        reliability: point.reliability,
        issues: []
      };

      // Check data freshness
      const ageMinutes = (Date.now() - point.timestamp.getTime()) / (1000 * 60);
      if (ageMinutes > 60) {
        result.issues.push('Data is older than 1 hour');
        result.reliability *= 0.8;
      }

      // Check reliability threshold
      if (point.reliability < 0.7) {
        result.issues.push('Source reliability below threshold');
        result.reliability *= 0.5;
      }

      // Check for suspicious values
      if (this.isSuspiciousValue(point.value)) {
        result.issues.push('Suspicious data value detected');
        result.reliability *= 0.6;
      }

      // Validate against other sources
      const consensusCheck = this.checkConsensus(point, data);
      if (!consensusCheck.hasConsensus) {
        result.issues.push('Value diverges significantly from other sources');
        result.reliability *= 0.7;
      }

      if (result.issues.length > 2) {
        result.isValid = false;
      }

      results.push(result);
    }

    return results;
  }

  private isSuspiciousValue(value: any): boolean {
    // Check for obviously invalid values
    if (typeof value === 'number') {
      return isNaN(value) || !isFinite(value) || value < 0;
    }
    
    if (typeof value === 'string') {
      return value.trim().length === 0 || value.includes('error') || value.includes('null');
    }

    return false;
  }

  private checkConsensus(point: DataPoint, allData: DataPoint[]): { hasConsensus: boolean; variance: number } {
    const similarPoints = allData.filter(p => 
      p.source !== point.source && 
      typeof p.value === typeof point.value
    );

    if (similarPoints.length === 0) {
      return { hasConsensus: true, variance: 0 };
    }

    // For numeric values, check variance
    if (typeof point.value === 'number') {
      const values = similarPoints.map(p => p.value as number);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = Math.abs((point.value as number) - mean) / mean;
      
      return {
        hasConsensus: variance < 0.1, // 10% variance threshold
        variance
      };
    }

    // For string values, check exact matches
    const matches = similarPoints.filter(p => p.value === point.value).length;
    const consensusRatio = matches / similarPoints.length;
    
    return {
      hasConsensus: consensusRatio >= 0.6,
      variance: 1 - consensusRatio
    };
  }

  private determineOutcome(validationResults: ValidationResult[]): string {
    const validData = validationResults.filter(r => r.isValid);
    
    if (validData.length === 0) {
      return 'INSUFFICIENT_VALID_DATA';
    }

    // Get the most common outcome from valid data
    const outcomes = validData.map(r => this.extractOutcome(r.dataPoint.value));
    const outcomeCount = outcomes.reduce((acc, outcome) => {
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(outcomeCount)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private extractOutcome(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'YES' : 'NO';
    }
    
    if (typeof value === 'number') {
      return value > 0.5 ? 'YES' : 'NO';
    }
    
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized.includes('yes') || normalized.includes('true') || normalized.includes('positive')) {
        return 'YES';
      }
      if (normalized.includes('no') || normalized.includes('false') || normalized.includes('negative')) {
        return 'NO';
      }
    }

    return 'UNCERTAIN';
  }

  private calculateConfidence(validationResults: ValidationResult[]): number {
    const validData = validationResults.filter(r => r.isValid);
    
    if (validData.length === 0) {
      return 0;
    }

    // Base confidence on data quality and consensus
    const avgReliability = validData.reduce((sum, r) => sum + r.reliability, 0) / validData.length;
    const dataRatio = validData.length / validationResults.length;
    
    return Math.min(0.95, avgReliability * dataRatio);
  }

  private generateReasoning(validationResults: ValidationResult[]): string[] {
    const reasoning: string[] = [];
    const validCount = validationResults.filter(r => r.isValid).length;
    const totalCount = validationResults.length;

    reasoning.push(`Validated ${totalCount} data points, ${validCount} passed validation`);
    
    if (validCount < totalCount) {
      const issues = validationResults
        .filter(r => !r.isValid)
        .flatMap(r => r.issues);
      
      const issueCount = issues.reduce((acc, issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      reasoning.push(`Common validation issues: ${Object.entries(issueCount)
        .map(([issue, count]) => `${issue} (${count})`)
        .join(', ')}`);
    }

    const avgReliability = validationResults
      .filter(r => r.isValid)
      .reduce((sum, r) => sum + r.reliability, 0) / Math.max(1, validCount);
    
    reasoning.push(`Average reliability of valid data: ${(avgReliability * 100).toFixed(1)}%`);

    return reasoning;
  }
}

interface ValidationResult {
  dataPoint: DataPoint;
  isValid: boolean;
  reliability: number;
  issues: string[];
}