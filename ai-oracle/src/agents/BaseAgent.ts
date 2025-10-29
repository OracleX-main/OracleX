/**
 * Base Agent Class
 * Abstract base class for all AI agents in the TruthMesh system
 */

import { EventEmitter } from 'events';
import { logger, createTimer, logAgentActivity } from '../utils/logger';
import { config } from '../config';
import { 
  AgentResponse, 
  AgentType, 
  DataPoint, 
  Market, 
  AgentStatus 
} from '../types';

export abstract class BaseAgent extends EventEmitter {
  protected id: string;
  protected type: AgentType;
  protected name: string;
  protected description: string;
  protected isActive: boolean = false;
  protected lastActivity: Date = new Date();
  protected tasksCompleted: number = 0;
  protected totalProcessingTime: number = 0;
  protected errorCount: number = 0;

  constructor(
    id: string,
    type: AgentType,
    name: string,
    description: string
  ) {
    super();
    this.id = id;
    this.type = type;
    this.name = name;
    this.description = description;
  }

  /**
   * Initialize the agent
   */
  public async initialize(): Promise<void> {
    try {
      logger.info(`🤖 Initializing agent: ${this.name}`);
      await this.onInitialize();
      this.isActive = true;
      logAgentActivity(this.id, 'initialized');
      logger.info(`✅ Agent ${this.name} initialized successfully`);
    } catch (error) {
      logger.error(`❌ Failed to initialize agent ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate response for a market
   */
  public async generateResponse(data: DataPoint[], market: Market): Promise<AgentResponse> {
    if (!this.isActive) {
      throw new Error(`Agent ${this.name} is not active`);
    }

    const timer = createTimer(`${this.id}_response_generation`);
    this.lastActivity = new Date();

    try {
      logAgentActivity(this.id, 'generating_response', { marketId: market.id });

      // Process the data and generate response
      const response = await Promise.race([
        this.processData(data, market),
        this.createTimeoutPromise()
      ]);

      const processingTime = timer.end({ marketId: market.id, success: true });
      this.tasksCompleted++;
      this.totalProcessingTime += processingTime;

      const agentResponse: AgentResponse = {
        agentId: this.id,
        agentType: this.type,
        outcome: response.outcome,
        confidence: response.confidence,
        reasoning: response.reasoning,
        dataUsed: response.dataUsed,
        timestamp: new Date(),
        processingTime
      };

      logAgentActivity(this.id, 'response_generated', {
        marketId: market.id,
        outcome: response.outcome,
        confidence: response.confidence,
        processingTime
      });

      this.emit('responseGenerated', agentResponse);
      return agentResponse;

    } catch (error) {
      timer.end({ marketId: market.id, success: false });
      this.errorCount++;
      
      logAgentActivity(this.id, 'response_failed', {
        marketId: market.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Get agent status
   */
  public getStatus(): AgentStatus {
    return {
      active: this.isActive,
      healthy: this.isHealthy(),
      lastActivity: this.lastActivity,
      tasksCompleted: this.tasksCompleted,
      averageResponseTime: this.tasksCompleted > 0 
        ? this.totalProcessingTime / this.tasksCompleted 
        : 0,
      errorRate: this.tasksCompleted > 0 
        ? this.errorCount / this.tasksCompleted 
        : 0
    };
  }

  /**
   * Check if agent is healthy
   */
  public isHealthy(): boolean {
    const now = Date.now();
    const lastActivityTime = this.lastActivity.getTime();
    const maxIdleTime = 5 * 60 * 1000; // 5 minutes
    
    const isRecentlyActive = (now - lastActivityTime) < maxIdleTime;
    const hasLowErrorRate = this.tasksCompleted === 0 || (this.errorCount / this.tasksCompleted) < 0.5;
    
    return this.isActive && isRecentlyActive && hasLowErrorRate;
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      logger.info(`🧹 Cleaning up agent: ${this.name}`);
      await this.onCleanup();
      this.isActive = false;
      logAgentActivity(this.id, 'cleanup_completed');
      logger.info(`✅ Agent ${this.name} cleanup completed`);
    } catch (error) {
      logger.error(`❌ Failed to cleanup agent ${this.name}:`, error);
    }
  }

  /**
   * Create timeout promise for agent operations
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${this.name} operation timed out after ${config.AGENT_TIMEOUT}ms`));
      }, config.AGENT_TIMEOUT);
    });
  }

  // Abstract methods to be implemented by concrete agents
  protected abstract onInitialize(): Promise<void>;
  protected abstract processData(data: DataPoint[], market: Market): Promise<{
    outcome: string;
    confidence: number;
    reasoning: string[];
    dataUsed: DataPoint[];
  }>;
  protected abstract onCleanup(): Promise<void>;

  // Getters
  public getId(): string { return this.id; }
  public getType(): AgentType { return this.type; }
  public getName(): string { return this.name; }
  public getDescription(): string { return this.description; }
  public getIsActive(): boolean { return this.isActive; }
  public getLastActivity(): Date { return this.lastActivity; }
  public getTasksCompleted(): number { return this.tasksCompleted; }
  public getAverageProcessingTime(): number {
    return this.tasksCompleted > 0 ? this.totalProcessingTime / this.tasksCompleted : 0;
  }
  public getErrorRate(): number {
    return this.tasksCompleted > 0 ? this.errorCount / this.tasksCompleted : 0;
  }
}