"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/status', async (req, res) => {
    try {
        const status = {
            active: true,
            healthy: true,
            lastActivity: new Date().toISOString(),
            agents: {
                dataFetcher: { status: 'active', lastRun: new Date().toISOString() },
                validator: { status: 'active', lastRun: new Date().toISOString() },
                arbiter: { status: 'active', lastRun: new Date().toISOString() },
                confidenceScorer: { status: 'active', lastRun: new Date().toISOString() }
            },
            blockchain: {
                connected: true,
                network: 'BNB Smart Chain',
                latestBlock: 35000000
            },
            metrics: {
                marketsResolved: 145,
                averageConfidence: 0.87,
                averageResolutionTime: 4500,
                disputeRate: 0.02
            }
        };
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching oracle status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch oracle status'
        });
    }
});
router.get('/resolutions', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const resolutions = [
            {
                id: 'res_1',
                marketId: '1',
                outcome: 'YES',
                confidence: 0.89,
                evidence: [
                    'Bitcoin price reached $105,000 on CoinGecko',
                    'Confirmed by multiple exchanges',
                    'High confidence from all agents'
                ],
                timestamp: '2024-12-31T23:59:59Z',
                disputeWindow: 3600000,
                resolved: true,
                disputed: false
            },
            {
                id: 'res_2',
                marketId: '2',
                outcome: 'NO',
                confidence: 0.76,
                evidence: [
                    'No major breakthrough announcements found',
                    'Tech giants focused on incremental improvements',
                    'Moderate confidence from validation agents'
                ],
                timestamp: '2024-12-30T18:30:00Z',
                disputeWindow: 3600000,
                resolved: true,
                disputed: false
            }
        ];
        res.json({
            success: true,
            data: resolutions,
            count: resolutions.length,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: resolutions.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching oracle resolutions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch oracle resolutions'
        });
    }
});
router.get('/resolutions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resolution = {
            id,
            marketId: '1',
            outcome: 'YES',
            confidence: 0.89,
            evidence: [
                'Bitcoin price reached $105,000 on CoinGecko',
                'Confirmed by multiple exchanges including Binance, Coinbase',
                'High confidence from all validation agents',
                'Multiple reliable data sources consensus'
            ],
            agentResponses: [
                {
                    agentId: 'data_fetcher',
                    outcome: 'YES',
                    confidence: 0.92,
                    reasoning: ['Price data confirmed across 5 major exchanges']
                },
                {
                    agentId: 'validator',
                    outcome: 'YES',
                    confidence: 0.88,
                    reasoning: ['Data validation passed with high reliability scores']
                },
                {
                    agentId: 'arbiter',
                    outcome: 'YES',
                    confidence: 0.86,
                    reasoning: ['No conflicts detected between data sources']
                }
            ],
            timestamp: '2024-12-31T23:59:59Z',
            disputeWindow: 3600000,
            resolved: true,
            disputed: false,
            blockchainTx: '0x1234567890abcdef...'
        };
        res.json({
            success: true,
            data: resolution
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching oracle resolution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch oracle resolution'
        });
    }
});
router.post('/resolve/:marketId', async (req, res) => {
    try {
        const { marketId } = req.params;
        logger_1.logger.info(`Resolution requested for market ${marketId}`);
        const resolutionRequest = {
            id: Date.now().toString(),
            marketId,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + 300000).toISOString()
        };
        res.status(202).json({
            success: true,
            message: 'Resolution request submitted',
            data: resolutionRequest
        });
    }
    catch (error) {
        logger_1.logger.error('Error requesting oracle resolution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request oracle resolution'
        });
    }
});
router.post('/resolutions/:id/dispute', async (req, res) => {
    try {
        const { id } = req.params;
        const { evidence, reason } = req.body;
        const dispute = {
            id: Date.now().toString(),
            resolutionId: id,
            evidence,
            reason,
            timestamp: new Date().toISOString(),
            disputedBy: 'current_user',
            status: 'pending_review'
        };
        logger_1.logger.info('Oracle resolution disputed:', dispute);
        res.status(201).json({
            success: true,
            message: 'Dispute submitted for review',
            data: dispute
        });
    }
    catch (error) {
        logger_1.logger.error('Error disputing oracle resolution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to dispute oracle resolution'
        });
    }
});
router.get('/agents/performance', async (req, res) => {
    try {
        const performance = {
            dataFetcher: {
                uptime: 0.998,
                averageResponseTime: 1200,
                successRate: 0.996,
                tasksCompleted: 1250
            },
            validator: {
                uptime: 0.999,
                averageResponseTime: 800,
                successRate: 0.998,
                tasksCompleted: 890
            },
            arbiter: {
                uptime: 1.0,
                averageResponseTime: 1500,
                successRate: 1.0,
                tasksCompleted: 345
            },
            confidenceScorer: {
                uptime: 0.997,
                averageResponseTime: 600,
                successRate: 0.995,
                tasksCompleted: 567
            }
        };
        res.json({
            success: true,
            data: performance
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching agent performance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent performance'
        });
    }
});
exports.default = router;
//# sourceMappingURL=oracles.js.map