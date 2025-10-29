import { BaseAgent } from './BaseAgent';
import { DataPoint, Market } from '../types';
export declare class ConfidenceScorerAgent extends BaseAgent {
    constructor();
    protected onInitialize(): Promise<void>;
    protected processData(data: DataPoint[], market: Market): Promise<{
        outcome: string;
        confidence: number;
        reasoning: string[];
        dataUsed: DataPoint[];
    }>;
    protected onCleanup(): Promise<void>;
    private analyzeConfidenceFactors;
    private assessDataQuality;
    private assessSourceReliability;
    private assessTemporalFactors;
    private assessConsensusFactors;
    private assessMarketFactors;
    private extractOutcome;
    private calculateVariance;
    private determineOutcome;
    private calculateOverallConfidence;
    private generateConfidenceReasoning;
}
