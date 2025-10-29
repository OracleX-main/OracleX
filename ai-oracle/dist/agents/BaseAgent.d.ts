import { EventEmitter } from 'events';
import { AgentResponse, AgentType, DataPoint, Market, AgentStatus } from '../types';
export declare abstract class BaseAgent extends EventEmitter {
    protected id: string;
    protected type: AgentType;
    protected name: string;
    protected description: string;
    protected isActive: boolean;
    protected lastActivity: Date;
    protected tasksCompleted: number;
    protected totalProcessingTime: number;
    protected errorCount: number;
    constructor(id: string, type: AgentType, name: string, description: string);
    initialize(): Promise<void>;
    generateResponse(data: DataPoint[], market: Market): Promise<AgentResponse>;
    getStatus(): AgentStatus;
    isHealthy(): boolean;
    cleanup(): Promise<void>;
    private createTimeoutPromise;
    protected abstract onInitialize(): Promise<void>;
    protected abstract processData(data: DataPoint[], market: Market): Promise<{
        outcome: string;
        confidence: number;
        reasoning: string[];
        dataUsed: DataPoint[];
    }>;
    protected abstract onCleanup(): Promise<void>;
    getId(): string;
    getType(): AgentType;
    getName(): string;
    getDescription(): string;
    getIsActive(): boolean;
    getLastActivity(): Date;
    getTasksCompleted(): number;
    getAverageProcessingTime(): number;
    getErrorRate(): number;
}
