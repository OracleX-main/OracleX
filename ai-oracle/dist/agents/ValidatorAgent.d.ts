import { BaseAgent } from './BaseAgent';
import { AgentResponse, DataPoint, Market } from '../types';
export declare class ValidatorAgent extends BaseAgent {
    constructor();
    protected onInitialize(): Promise<void>;
    protected processData(data: DataPoint[], market: Market): Promise<{
        outcome: string;
        confidence: number;
        reasoning: string[];
        dataUsed: DataPoint[];
    }>;
    protected onCleanup(): Promise<void>;
    processMarket(marketId: string, data: DataPoint[]): Promise<AgentResponse>;
    private validateData;
    private isSuspiciousValue;
    private checkConsensus;
    private determineOutcome;
    private extractOutcome;
    private calculateConfidence;
    private generateReasoning;
}
