import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { OracleResult } from '../types';
export declare class TruthMeshOracle extends EventEmitter {
    private io;
    private blockchain;
    private dataFetcher;
    private validator;
    private arbiter;
    private confidenceScorer;
    private consensusEngine;
    private isInitialized;
    private activeResolutions;
    constructor(io: SocketIOServer);
    initialize(): Promise<void>;
    resolveMarket(marketId: string): Promise<OracleResult>;
    private performResolution;
    handleDispute(marketId: string, evidence: string[]): Promise<OracleResult>;
    getSystemStatus(): Promise<{
        initialized: boolean;
        activeResolutions: number;
        blockchain: any;
        agents: {
            dataFetcher: import("../types").AgentStatus;
            validator: import("../types").AgentStatus;
            arbiter: import("../types").AgentStatus;
            confidenceScorer: import("../types").AgentStatus;
        };
        consensusEngine: any;
        uptime: number;
        timestamp: Date;
    }>;
    private setupEventListeners;
    cleanup(): Promise<void>;
}
