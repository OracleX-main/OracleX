"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbiterAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
class ArbiterAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('arbiter', types_1.AgentType.ARBITER, 'Arbiter Agent', 'Resolves conflicts and makes final decisions');
    }
    async onInitialize() {
        logger_1.logger.info('Arbiter Agent initializing...');
    }
    async processData(data, market) {
        logger_1.logger.info(`Arbiter processing market ${market.id} with ${data.length} data points`);
        const conflictAnalysis = await this.analyzeConflicts(data);
        const outcome = this.makeArbitrationDecision(conflictAnalysis, market);
        const confidence = this.calculateArbitrationConfidence(conflictAnalysis);
        const reasoning = this.generateArbitrationReasoning(conflictAnalysis);
        return {
            outcome,
            confidence,
            reasoning,
            dataUsed: data
        };
    }
    async onCleanup() {
        logger_1.logger.info('Arbiter Agent cleaning up...');
    }
    async analyzeConflicts(data) {
        const sourceGroups = this.groupDataBySources(data);
        const conflicts = [];
        const sources = Object.keys(sourceGroups);
        for (let i = 0; i < sources.length; i++) {
            for (let j = i + 1; j < sources.length; j++) {
                const source1 = sources[i];
                const source2 = sources[j];
                const conflict = this.detectConflict(sourceGroups[source1], sourceGroups[source2], source1, source2);
                if (conflict) {
                    conflicts.push(conflict);
                }
            }
        }
        return {
            totalSources: sources.length,
            conflicts,
            consensusLevel: this.calculateConsensusLevel(sourceGroups),
            reliabilityWeights: this.calculateReliabilityWeights(data)
        };
    }
    groupDataBySources(data) {
        return data.reduce((groups, point) => {
            if (!groups[point.source]) {
                groups[point.source] = [];
            }
            groups[point.source].push(point);
            return groups;
        }, {});
    }
    detectConflict(source1Data, source2Data, source1, source2) {
        const latest1 = source1Data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        const latest2 = source2Data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        if (!latest1 || !latest2)
            return null;
        const divergence = this.calculateDivergence(latest1.value, latest2.value);
        if (divergence > 0.2) {
            return {
                source1,
                source2,
                value1: latest1.value,
                value2: latest2.value,
                divergence,
                severity: divergence > 0.5 ? 'HIGH' : 'MEDIUM',
                timestamp1: latest1.timestamp,
                timestamp2: latest2.timestamp
            };
        }
        return null;
    }
    calculateDivergence(value1, value2) {
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            const avg = (value1 + value2) / 2;
            return Math.abs(value1 - value2) / avg;
        }
        if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
            return value1 === value2 ? 0 : 1;
        }
        if (typeof value1 === 'string' && typeof value2 === 'string') {
            return value1.toLowerCase() === value2.toLowerCase() ? 0 : 1;
        }
        return value1 === value2 ? 0 : 1;
    }
    calculateConsensusLevel(sourceGroups) {
        const sources = Object.keys(sourceGroups);
        if (sources.length < 2)
            return 1;
        const values = sources.map(source => {
            const latest = sourceGroups[source]
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
            return latest?.value;
        }).filter(v => v !== undefined);
        const valueCount = values.reduce((acc, value) => {
            const key = JSON.stringify(value);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const maxAgreement = Math.max(...Object.values(valueCount));
        return maxAgreement / values.length;
    }
    calculateReliabilityWeights(data) {
        const sourceReliability = {};
        data.forEach(point => {
            if (!sourceReliability[point.source]) {
                sourceReliability[point.source] = [];
            }
            sourceReliability[point.source].push(point.reliability);
        });
        const weights = {};
        Object.entries(sourceReliability).forEach(([source, reliabilities]) => {
            weights[source] = reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
        });
        return weights;
    }
    makeArbitrationDecision(analysis, market) {
        if (analysis.consensusLevel > 0.8) {
            return this.getMajorityOutcome(analysis);
        }
        if (analysis.conflicts.length > 0) {
            return this.getWeightedOutcome(analysis);
        }
        const mostReliableSource = Object.entries(analysis.reliabilityWeights)
            .sort(([, a], [, b]) => b - a)[0];
        return mostReliableSource ? 'UNCERTAIN' : 'NO_DATA';
    }
    getMajorityOutcome(analysis) {
        return analysis.consensusLevel > 0.8 ? 'YES' : 'NO';
    }
    getWeightedOutcome(analysis) {
        const reliabilities = Object.values(analysis.reliabilityWeights);
        const avgReliability = reliabilities.reduce((sum, r) => sum + r, 0) / reliabilities.length;
        return avgReliability > 0.7 ? 'YES' : 'UNCERTAIN';
    }
    calculateArbitrationConfidence(analysis) {
        let confidence = analysis.consensusLevel;
        const highSeverityConflicts = analysis.conflicts.filter(c => c.severity === 'HIGH').length;
        confidence *= Math.max(0.3, 1 - (highSeverityConflicts * 0.2));
        const avgReliability = Object.values(analysis.reliabilityWeights)
            .reduce((sum, r) => sum + r, 0) / Object.keys(analysis.reliabilityWeights).length;
        confidence = (confidence + avgReliability) / 2;
        return Math.min(0.95, Math.max(0.1, confidence));
    }
    generateArbitrationReasoning(analysis) {
        const reasoning = [];
        reasoning.push(`Analyzed ${analysis.totalSources} data sources`);
        reasoning.push(`Consensus level: ${(analysis.consensusLevel * 100).toFixed(1)}%`);
        if (analysis.conflicts.length > 0) {
            reasoning.push(`Found ${analysis.conflicts.length} conflicts between sources`);
            const highSeverity = analysis.conflicts.filter(c => c.severity === 'HIGH').length;
            if (highSeverity > 0) {
                reasoning.push(`${highSeverity} high-severity conflicts detected`);
            }
        }
        else {
            reasoning.push('No significant conflicts detected between sources');
        }
        const avgReliability = Object.values(analysis.reliabilityWeights)
            .reduce((sum, r) => sum + r, 0) / Object.keys(analysis.reliabilityWeights).length;
        reasoning.push(`Average source reliability: ${(avgReliability * 100).toFixed(1)}%`);
        return reasoning;
    }
    async resolveDispute(evidence, market) {
        logger_1.logger.info(`Resolving dispute for market ${market.id}`);
        return {
            outcome: 'DISPUTE_RESOLVED',
            confidence: 0.8,
            evidence: evidence,
            reasoning: 'Dispute resolved through arbitration',
            timestamp: new Date()
        };
    }
}
exports.ArbiterAgent = ArbiterAgent;
//# sourceMappingURL=ArbiterAgent.js.map