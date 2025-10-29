import { BaseAgent } from './BaseAgent';
import { AgentResponse, DataPoint, AgentType, Market } from '../types';
import { logger } from '../utils/logger';

export class ArbiterAgent extends BaseAgent {
  constructor() {
    super('arbiter', AgentType.ARBITER, 'Arbiter Agent', 'Resolves conflicts and makes final decisions');
  }

  protected async onInitialize(): Promise<void> {
    logger.info('Arbiter Agent initializing...');
    // Initialize arbitration parameters
  }

  protected async processData(data: DataPoint[], market: Market): Promise<{
    outcome: string;
    confidence: number;
    reasoning: string[];
    dataUsed: DataPoint[];
  }> {
    logger.info(`Arbiter processing market ${market.id} with ${data.length} data points`);

    // Analyze conflicts and make final decision
    const conflictAnalysis = await this.analyzeConflicts(data);
    const outcome = this.makeArbitrationDecision(conflictAnalysis, market);
    const confidence = this.calculateArbitrationConfidence(conflictAnalysis);
    const reasoning = this.generateArbitrationReasoning(conflictAnalysis);

    return {
      outcome,
      confidence,
      reasoning,
      dataUsed: data
    };
  }

  protected async onCleanup(): Promise<void> {
    logger.info('Arbiter Agent cleaning up...');
  }

  private async analyzeConflicts(data: DataPoint[]): Promise<ConflictAnalysis> {
    const sourceGroups = this.groupDataBySources(data);
    const conflicts: Conflict[] = [];
    
    // Find conflicts between different sources
    const sources = Object.keys(sourceGroups);
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = sources[i];
        const source2 = sources[j];
        
        const conflict = this.detectConflict(
          sourceGroups[source1],
          sourceGroups[source2],
          source1,
          source2
        );
        
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return {
      totalSources: sources.length,
      conflicts,
      consensusLevel: this.calculateConsensusLevel(sourceGroups),
      reliabilityWeights: this.calculateReliabilityWeights(data)
    };
  }

  private groupDataBySources(data: DataPoint[]): Record<string, DataPoint[]> {
    return data.reduce((groups, point) => {
      if (!groups[point.source]) {
        groups[point.source] = [];
      }
      groups[point.source].push(point);
      return groups;
    }, {} as Record<string, DataPoint[]>);
  }

  private detectConflict(
    source1Data: DataPoint[],
    source2Data: DataPoint[],
    source1: string,
    source2: string
  ): Conflict | null {
    // Compare latest values from each source
    const latest1 = source1Data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    const latest2 = source2Data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!latest1 || !latest2) return null;

    const divergence = this.calculateDivergence(latest1.value, latest2.value);
    
    if (divergence > 0.2) { // 20% divergence threshold
      return {
        source1,
        source2,
        value1: latest1.value,
        value2: latest2.value,
        divergence,
        severity: divergence > 0.5 ? 'HIGH' : 'MEDIUM',
        timestamp1: latest1.timestamp,
        timestamp2: latest2.timestamp
      };
    }

    return null;
  }

  private calculateDivergence(value1: any, value2: any): number {
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      const avg = (value1 + value2) / 2;
      return Math.abs(value1 - value2) / avg;
    }
    
    if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
      return value1 === value2 ? 0 : 1;
    }
    
    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return value1.toLowerCase() === value2.toLowerCase() ? 0 : 1;
    }
    
    return value1 === value2 ? 0 : 1;
  }

  private calculateConsensusLevel(sourceGroups: Record<string, DataPoint[]>): number {
    const sources = Object.keys(sourceGroups);
    if (sources.length < 2) return 1;

    const values = sources.map(source => {
      const latest = sourceGroups[source]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      return latest?.value;
    }).filter(v => v !== undefined);

    // Calculate how many values agree
    const valueCount = values.reduce((acc, value) => {
      const key = JSON.stringify(value);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxAgreement = Math.max(...Object.values(valueCount) as number[]);
    return maxAgreement / values.length;
  }

  private calculateReliabilityWeights(data: DataPoint[]): Record<string, number> {
    const sourceReliability: Record<string, number[]> = {};
    
    data.forEach(point => {
      if (!sourceReliability[point.source]) {
        sourceReliability[point.source] = [];
      }
      sourceReliability[point.source].push(point.reliability);
    });

    const weights: Record<string, number> = {};
    Object.entries(sourceReliability).forEach(([source, reliabilities]) => {
      weights[source] = reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
    });

    return weights;
  }

  private makeArbitrationDecision(analysis: ConflictAnalysis, market: Market): string {
    // If high consensus, go with majority
    if (analysis.consensusLevel > 0.8) {
      return this.getMajorityOutcome(analysis);
    }

    // If conflicts exist, use weighted decision based on reliability
    if (analysis.conflicts.length > 0) {
      return this.getWeightedOutcome(analysis);
    }

    // Default to most reliable source
    const mostReliableSource = Object.entries(analysis.reliabilityWeights)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostReliableSource ? 'UNCERTAIN' : 'NO_DATA';
  }

  private getMajorityOutcome(analysis: ConflictAnalysis): string {
    // This would need actual data values to implement properly
    // For now, return a placeholder
    return analysis.consensusLevel > 0.8 ? 'YES' : 'NO';
  }

  private getWeightedOutcome(analysis: ConflictAnalysis): string {
    // Weight outcomes by source reliability
    // This is a simplified implementation
    const reliabilities = Object.values(analysis.reliabilityWeights);
    const avgReliability = reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
    
    return avgReliability > 0.7 ? 'YES' : 'UNCERTAIN';
  }

  private calculateArbitrationConfidence(analysis: ConflictAnalysis): number {
    // Base confidence on consensus level and conflict severity
    let confidence = analysis.consensusLevel;
    
    // Reduce confidence for high-severity conflicts
    const highSeverityConflicts = analysis.conflicts.filter(c => c.severity === 'HIGH').length;
    confidence *= Math.max(0.3, 1 - (highSeverityConflicts * 0.2));
    
    // Boost confidence for high reliability
    const avgReliability = Object.values(analysis.reliabilityWeights)
      .reduce((sum, r) => sum + r, 0) / Object.keys(analysis.reliabilityWeights).length;
    confidence = (confidence + avgReliability) / 2;
    
    return Math.min(0.95, Math.max(0.1, confidence));
  }

  private generateArbitrationReasoning(analysis: ConflictAnalysis): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Analyzed ${analysis.totalSources} data sources`);
    reasoning.push(`Consensus level: ${(analysis.consensusLevel * 100).toFixed(1)}%`);
    
    if (analysis.conflicts.length > 0) {
      reasoning.push(`Found ${analysis.conflicts.length} conflicts between sources`);
      const highSeverity = analysis.conflicts.filter(c => c.severity === 'HIGH').length;
      if (highSeverity > 0) {
        reasoning.push(`${highSeverity} high-severity conflicts detected`);
      }
    } else {
      reasoning.push('No significant conflicts detected between sources');
    }
    
    const avgReliability = Object.values(analysis.reliabilityWeights)
      .reduce((sum, r) => sum + r, 0) / Object.keys(analysis.reliabilityWeights).length;
    reasoning.push(`Average source reliability: ${(avgReliability * 100).toFixed(1)}%`);
    
    return reasoning;
  }

  // Additional method for dispute resolution
  async resolveDispute(evidence: string[], market: Market): Promise<any> {
    logger.info(`Resolving dispute for market ${market.id}`);
    
    // Simplified dispute resolution
    return {
      outcome: 'DISPUTE_RESOLVED',
      confidence: 0.8,
      evidence: evidence,
      reasoning: 'Dispute resolved through arbitration',
      timestamp: new Date()
    };
  }
}

interface ConflictAnalysis {
  totalSources: number;
  conflicts: Conflict[];
  consensusLevel: number;
  reliabilityWeights: Record<string, number>;
}

interface Conflict {
  source1: string;
  source2: string;
  value1: any;
  value2: any;
  divergence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp1: Date;
  timestamp2: Date;
}