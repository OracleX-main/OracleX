import { EventEmitter } from 'events';
import { AgentResponse, ConsensusResult, OracleConfig } from '../types';
export declare class ConsensusEngine extends EventEmitter {
    private config;
    private activeConsensus;
    constructor(config: OracleConfig);
    initialize(): Promise<void>;
    private setupEventHandlers;
    startConsensus(marketId: string, agentResponses: AgentResponse[]): Promise<ConsensusResult>;
    private runConsensusAlgorithm;
    private singleAgentConsensus;
    private checkUnanimousConsensus;
    private weightedVotingConsensus;
    private calculateAgentWeight;
    private calculateConsensusConfidence;
    private combineEvidence;
    private handleAgentResponse;
    private handleConsensusTimeout;
    getActiveConsensusCount(): number;
    getConsensusStatus(marketId: string): ConsensusSession | null;
    cleanup(): Promise<void>;
    formConsensus(agentResponses: AgentResponse[], market?: any): Promise<ConsensusResult>;
    getStatus(): any;
}
interface ConsensusSession {
    marketId: string;
    agentResponses: AgentResponse[];
    startTime: number;
    isComplete: boolean;
    result: ConsensusResult | null;
}
export {};
