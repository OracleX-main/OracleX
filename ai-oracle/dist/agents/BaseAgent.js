"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
class BaseAgent extends events_1.EventEmitter {
    constructor(id, type, name, description) {
        super();
        this.isActive = false;
        this.lastActivity = new Date();
        this.tasksCompleted = 0;
        this.totalProcessingTime = 0;
        this.errorCount = 0;
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
    }
    async initialize() {
        try {
            logger_1.logger.info(`🤖 Initializing agent: ${this.name}`);
            await this.onInitialize();
            this.isActive = true;
            (0, logger_1.logAgentActivity)(this.id, 'initialized');
            logger_1.logger.info(`✅ Agent ${this.name} initialized successfully`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to initialize agent ${this.name}:`, error);
            throw error;
        }
    }
    async generateResponse(data, market) {
        if (!this.isActive) {
            throw new Error(`Agent ${this.name} is not active`);
        }
        const timer = (0, logger_1.createTimer)(`${this.id}_response_generation`);
        this.lastActivity = new Date();
        try {
            (0, logger_1.logAgentActivity)(this.id, 'generating_response', { marketId: market.id });
            const response = await Promise.race([
                this.processData(data, market),
                this.createTimeoutPromise()
            ]);
            const processingTime = timer.end({ marketId: market.id, success: true });
            this.tasksCompleted++;
            this.totalProcessingTime += processingTime;
            const agentResponse = {
                agentId: this.id,
                agentType: this.type,
                outcome: response.outcome,
                confidence: response.confidence,
                reasoning: response.reasoning,
                dataUsed: response.dataUsed,
                timestamp: new Date(),
                processingTime
            };
            (0, logger_1.logAgentActivity)(this.id, 'response_generated', {
                marketId: market.id,
                outcome: response.outcome,
                confidence: response.confidence,
                processingTime
            });
            this.emit('responseGenerated', agentResponse);
            return agentResponse;
        }
        catch (error) {
            timer.end({ marketId: market.id, success: false });
            this.errorCount++;
            (0, logger_1.logAgentActivity)(this.id, 'response_failed', {
                marketId: market.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    getStatus() {
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
    isHealthy() {
        const now = Date.now();
        const lastActivityTime = this.lastActivity.getTime();
        const maxIdleTime = 5 * 60 * 1000;
        const isRecentlyActive = (now - lastActivityTime) < maxIdleTime;
        const hasLowErrorRate = this.tasksCompleted === 0 || (this.errorCount / this.tasksCompleted) < 0.5;
        return this.isActive && isRecentlyActive && hasLowErrorRate;
    }
    async cleanup() {
        try {
            logger_1.logger.info(`🧹 Cleaning up agent: ${this.name}`);
            await this.onCleanup();
            this.isActive = false;
            (0, logger_1.logAgentActivity)(this.id, 'cleanup_completed');
            logger_1.logger.info(`✅ Agent ${this.name} cleanup completed`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to cleanup agent ${this.name}:`, error);
        }
    }
    createTimeoutPromise() {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Agent ${this.name} operation timed out after ${config_1.config.AGENT_TIMEOUT}ms`));
            }, config_1.config.AGENT_TIMEOUT);
        });
    }
    getId() { return this.id; }
    getType() { return this.type; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getIsActive() { return this.isActive; }
    getLastActivity() { return this.lastActivity; }
    getTasksCompleted() { return this.tasksCompleted; }
    getAverageProcessingTime() {
        return this.tasksCompleted > 0 ? this.totalProcessingTime / this.tasksCompleted : 0;
    }
    getErrorRate() {
        return this.tasksCompleted > 0 ? this.errorCount / this.tasksCompleted : 0;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map