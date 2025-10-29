"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentsRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../../utils/logger");
const router = (0, express_1.Router)();
exports.agentsRoutes = router;
router.get('/', async (req, res) => {
    try {
        const agents = [
            {
                id: 'data_fetcher',
                name: 'Data Fetcher',
                status: 'active',
                lastActive: new Date().toISOString(),
                processedEvents: 1250,
                errorRate: 0.02
            },
            {
                id: 'validator',
                name: 'Validator Agent',
                status: 'active',
                lastActive: new Date().toISOString(),
                processedEvents: 890,
                errorRate: 0.01
            },
            {
                id: 'arbiter',
                name: 'Arbiter Agent',
                status: 'active',
                lastActive: new Date().toISOString(),
                processedEvents: 345,
                errorRate: 0.00
            },
            {
                id: 'confidence_scorer',
                name: 'Confidence Scorer',
                status: 'active',
                lastActive: new Date().toISOString(),
                processedEvents: 567,
                errorRate: 0.03
            }
        ];
        res.json({
            success: true,
            data: agents,
            summary: {
                total: agents.length,
                active: agents.filter(a => a.status === 'active').length,
                avgErrorRate: agents.reduce((acc, a) => acc + a.errorRate, 0) / agents.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching agents status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agents status'
        });
    }
});
router.get('/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const agent = {
            id: agentId,
            name: agentId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: 'active',
            lastActive: new Date().toISOString(),
            processedEvents: Math.floor(Math.random() * 1000),
            errorRate: Math.random() * 0.05,
            metrics: {
                avgProcessingTime: Math.floor(Math.random() * 100) + 50,
                memoryUsage: Math.floor(Math.random() * 50) + 20,
                cpuUsage: Math.floor(Math.random() * 30) + 10
            },
            recentEvents: [
                {
                    timestamp: new Date().toISOString(),
                    type: 'DATA_PROCESSED',
                    details: 'Successfully processed market data'
                }
            ]
        };
        res.json({
            success: true,
            data: agent
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching agent status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent status'
        });
    }
});
router.post('/:agentId/restart', async (req, res) => {
    try {
        const { agentId } = req.params;
        logger_1.logger.info(`Restarting agent: ${agentId}`);
        res.json({
            success: true,
            message: `Agent ${agentId} restart initiated`
        });
    }
    catch (error) {
        logger_1.logger.error('Error restarting agent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restart agent'
        });
    }
});
//# sourceMappingURL=agents.js.map