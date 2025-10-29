import { BaseAgent } from './BaseAgent';
import { DataPoint, Market } from '../types';
export declare class ArbiterAgent extends BaseAgent {
    constructor();
    protected onInitialize(): Promise<void>;
    protected processData(data: DataPoint[], market: Market): Promise<{
        outcome: string;
        confidence: number;
        reasoning: string[];
        dataUsed: DataPoint[];
    }>;
    protected onCleanup(): Promise<void>;
    private analyzeConflicts;
    private groupDataBySources;
    private detectConflict;
    private calculateDivergence;
    private calculateConsensusLevel;
    private calculateReliabilityWeights;
    private makeArbitrationDecision;
    private getMajorityOutcome;
    private getWeightedOutcome;
    private calculateArbitrationConfidence;
    private generateArbitrationReasoning;
    resolveDispute(evidence: string[], market: Market): Promise<any>;
}
