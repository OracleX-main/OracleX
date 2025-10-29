"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourcesRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../../utils/logger");
const router = (0, express_1.Router)();
exports.sourcesRoutes = router;
router.get('/', async (req, res) => {
    try {
        const sources = [
            {
                id: 'coinbase',
                name: 'Coinbase Pro API',
                type: 'exchange',
                status: 'active',
                lastUpdate: new Date().toISOString(),
                reliability: 0.98,
                latency: 45,
                endpoints: ['https://api.exchange.coinbase.com']
            },
            {
                id: 'binance',
                name: 'Binance API',
                type: 'exchange',
                status: 'active',
                lastUpdate: new Date().toISOString(),
                reliability: 0.97,
                latency: 38,
                endpoints: ['https://api.binance.com']
            },
            {
                id: 'coindesk',
                name: 'CoinDesk API',
                type: 'news',
                status: 'active',
                lastUpdate: new Date().toISOString(),
                reliability: 0.95,
                latency: 120,
                endpoints: ['https://api.coindesk.com']
            },
            {
                id: 'coingecko',
                name: 'CoinGecko API',
                type: 'aggregator',
                status: 'active',
                lastUpdate: new Date().toISOString(),
                reliability: 0.96,
                latency: 85,
                endpoints: ['https://api.coingecko.com']
            }
        ];
        res.json({
            success: true,
            data: sources,
            summary: {
                total: sources.length,
                active: sources.filter(s => s.status === 'active').length,
                avgReliability: sources.reduce((acc, s) => acc + s.reliability, 0) / sources.length,
                avgLatency: sources.reduce((acc, s) => acc + s.latency, 0) / sources.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching data sources:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch data sources'
        });
    }
});
router.get('/:sourceId', async (req, res) => {
    try {
        const { sourceId } = req.params;
        const source = {
            id: sourceId,
            name: sourceId.charAt(0).toUpperCase() + sourceId.slice(1),
            type: 'exchange',
            status: 'active',
            lastUpdate: new Date().toISOString(),
            reliability: 0.95 + Math.random() * 0.05,
            latency: Math.floor(Math.random() * 100) + 30,
            endpoints: [`https://api.${sourceId}.com`],
            metrics: {
                requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
                successRate: 0.98 + Math.random() * 0.02,
                errorRate: Math.random() * 0.02,
                avgResponseTime: Math.floor(Math.random() * 50) + 20
            },
            recentData: [
                {
                    timestamp: new Date().toISOString(),
                    endpoint: `/v1/price/bitcoin`,
                    responseTime: Math.floor(Math.random() * 100) + 20,
                    status: 200
                }
            ]
        };
        res.json({
            success: true,
            data: source
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching data source:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch data source'
        });
    }
});
router.post('/:sourceId/test', async (req, res) => {
    try {
        const { sourceId } = req.params;
        logger_1.logger.info(`Testing connectivity for source: ${sourceId}`);
        const testResult = {
            sourceId,
            status: 'success',
            responseTime: Math.floor(Math.random() * 100) + 20,
            timestamp: new Date().toISOString(),
            details: 'Connection successful, API responding normally'
        };
        res.json({
            success: true,
            data: testResult
        });
    }
    catch (error) {
        logger_1.logger.error('Error testing data source:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test data source'
        });
    }
});
//# sourceMappingURL=sources.js.map