"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketsRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../../utils/logger");
const router = (0, express_1.Router)();
exports.marketsRoutes = router;
router.get('/', async (req, res) => {
    try {
        const markets = [
            {
                id: '1',
                title: 'Bitcoin Price Above $100,000 by End of 2024',
                category: 'crypto',
                status: 'active',
                endDate: '2024-12-31T23:59:59Z',
                totalVolume: '50000',
                participants: 234
            }
        ];
        res.json({
            success: true,
            data: markets,
            count: markets.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching markets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch markets'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const market = {
            id,
            title: 'Bitcoin Price Above $100,000 by End of 2024',
            description: 'Prediction market for Bitcoin reaching $100,000 USD',
            category: 'crypto',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            totalVolume: '50000',
            participants: 234,
            currentPrice: 0.65,
            oracleData: {
                lastUpdate: new Date().toISOString(),
                confidence: 0.85,
                sources: ['coinbase', 'binance', 'coindesk']
            }
        };
        res.json({
            success: true,
            data: market
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching market:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, description, category, endDate } = req.body;
        const newMarket = {
            id: Date.now().toString(),
            title,
            description,
            category,
            endDate,
            status: 'active',
            createdAt: new Date().toISOString(),
            totalVolume: '0',
            participants: 0
        };
        logger_1.logger.info('Market created:', newMarket);
        res.status(201).json({
            success: true,
            data: newMarket
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating market:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create market'
        });
    }
});
//# sourceMappingURL=markets.js.map