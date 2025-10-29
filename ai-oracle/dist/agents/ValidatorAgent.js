"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class ValidatorAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('validator', types_1.AgentType.VALIDATOR, 'Validator Agent', 'Validates data quality and consistency');
    }
    async onInitialize() {
        logger_1.logger.info('Validator Agent initializing...');
    }
    async processData(data, market) {
        logger_1.logger.info(`Validator processing market ${market.id} with ${data.length} data points`);
        const validationResults = await this.validateData(data);
        const outcome = this.determineOutcome(validationResults);
        const confidence = this.calculateConfidence(validationResults);
        const reasoning = this.generateReasoning(validationResults);
        return {
            outcome,
            confidence,
            reasoning,
            dataUsed: data
        };
    }
    async onCleanup() {
        logger_1.logger.info('Validator Agent cleaning up...');
    }
    async processMarket(marketId, data) {
        const startTime = Date.now();
        try {
            logger_1.logger.info(`Validator processing market ${marketId} with ${data.length} data points`);
            const market = {
                id: marketId,
                question: 'Unknown Market',
                category: 'general',
                outcomes: ['YES', 'NO'],
                deadline: new Date(),
                createdAt: new Date(),
                creator: 'system',
                totalStake: 0,
                status: 'ACTIVE'
            };
            const result = await this.processData(data, market);
            const response = {
                agentId: this.getId(),
                agentType: this.getType(),
                outcome: result.outcome,
                confidence: result.confidence,
                reasoning: result.reasoning,
                dataUsed: result.dataUsed,
                timestamp: new Date(),
                processingTime: Date.now() - startTime
            };
            this.emit('responseGenerated', response);
            logger_1.logger.info(`Validator completed processing for market ${marketId}`);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`Validator failed to process market ${marketId}:`, error);
            throw error;
        }
    }
    async validateData(data) {
        const results = [];
        for (const point of data) {
            const result = {
                dataPoint: point,
                isValid: true,
                reliability: point.reliability,
                issues: []
            };
            const ageMinutes = (Date.now() - point.timestamp.getTime()) / (1000 * 60);
            if (ageMinutes > 60) {
                result.issues.push('Data is older than 1 hour');
                result.reliability *= 0.8;
            }
            if (point.reliability < 0.7) {
                result.issues.push('Source reliability below threshold');
                result.reliability *= 0.5;
            }
            if (this.isSuspiciousValue(point.value)) {
                result.issues.push('Suspicious data value detected');
                result.reliability *= 0.6;
            }
            const consensusCheck = this.checkConsensus(point, data);
            if (!consensusCheck.hasConsensus) {
                result.issues.push('Value diverges significantly from other sources');
                result.reliability *= 0.7;
            }
            if (result.issues.length > 2) {
                result.isValid = false;
            }
            results.push(result);
        }
        return results;
    }
    isSuspiciousValue(value) {
        if (typeof value === 'number') {
            return isNaN(value) || !isFinite(value) || value < 0;
        }
        if (typeof value === 'string') {
            return value.trim().length === 0 || value.includes('error') || value.includes('null');
        }
        return false;
    }
    checkConsensus(point, allData) {
        const similarPoints = allData.filter(p => p.source !== point.source &&
            typeof p.value === typeof point.value);
        if (similarPoints.length === 0) {
            return { hasConsensus: true, variance: 0 };
        }
        if (typeof point.value === 'number') {
            const values = similarPoints.map(p => p.value);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = Math.abs(point.value - mean) / mean;
            return {
                hasConsensus: variance < 0.1,
                variance
            };
        }
        const matches = similarPoints.filter(p => p.value === point.value).length;
        const consensusRatio = matches / similarPoints.length;
        return {
            hasConsensus: consensusRatio >= 0.6,
            variance: 1 - consensusRatio
        };
    }
    determineOutcome(validationResults) {
        const validData = validationResults.filter(r => r.isValid);
        if (validData.length === 0) {
            return 'INSUFFICIENT_VALID_DATA';
        }
        const outcomes = validData.map(r => this.extractOutcome(r.dataPoint.value));
        const outcomeCount = outcomes.reduce((acc, outcome) => {
            acc[outcome] = (acc[outcome] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(outcomeCount)
            .sort(([, a], [, b]) => b - a)[0][0];
    }
    extractOutcome(value) {
        if (typeof value === 'boolean') {
            return value ? 'YES' : 'NO';
        }
        if (typeof value === 'number') {
            return value > 0.5 ? 'YES' : 'NO';
        }
        if (typeof value === 'string') {
            const normalized = value.toLowerCase().trim();
            if (normalized.includes('yes') || normalized.includes('true') || normalized.includes('positive')) {
                return 'YES';
            }
            if (normalized.includes('no') || normalized.includes('false') || normalized.includes('negative')) {
                return 'NO';
            }
        }
        return 'UNCERTAIN';
    }
    calculateConfidence(validationResults) {
        const validData = validationResults.filter(r => r.isValid);
        if (validData.length === 0) {
            return 0;
        }
        const avgReliability = validData.reduce((sum, r) => sum + r.reliability, 0) / validData.length;
        const dataRatio = validData.length / validationResults.length;
        return Math.min(0.95, avgReliability * dataRatio);
    }
    generateReasoning(validationResults) {
        const reasoning = [];
        const validCount = validationResults.filter(r => r.isValid).length;
        const totalCount = validationResults.length;
        reasoning.push(`Validated ${totalCount} data points, ${validCount} passed validation`);
        if (validCount < totalCount) {
            const issues = validationResults
                .filter(r => !r.isValid)
                .flatMap(r => r.issues);
            const issueCount = issues.reduce((acc, issue) => {
                acc[issue] = (acc[issue] || 0) + 1;
                return acc;
            }, {});
            reasoning.push(`Common validation issues: ${Object.entries(issueCount)
                .map(([issue, count]) => `${issue} (${count})`)
                .join(', ')}`);
        }
        const avgReliability = validationResults
            .filter(r => r.isValid)
            .reduce((sum, r) => sum + r.reliability, 0) / Math.max(1, validCount);
        reasoning.push(`Average reliability of valid data: ${(avgReliability * 100).toFixed(1)}%`);
        return reasoning;
    }
}
exports.ValidatorAgent = ValidatorAgent;
//# sourceMappingURL=ValidatorAgent.js.map