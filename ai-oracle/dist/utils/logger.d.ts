import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logMarketResolution: (marketId: string, status: string, metadata?: any) => void;
export declare const logAgentActivity: (agentId: string, activity: string, metadata?: any) => void;
export declare const logConsensus: (marketId: string, outcome: string, confidence: number, metadata?: any) => void;
export declare const logBlockchainTransaction: (txHash: string, type: string, metadata?: any) => void;
export declare const logError: (error: Error, context?: string, metadata?: any) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
export declare const createTimer: (operation: string) => {
    end: (metadata?: any) => number;
};
export default logger;
