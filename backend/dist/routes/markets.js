"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const markets = [
            {
                id: '1',
                title: 'Bitcoin Price Above $100,000 by End of 2024',
                description: 'Will Bitcoin (BTC) reach or exceed $100,000 USD by December 31, 2024?',
                category: 'crypto',
                status: 'active',
                createdAt: '2024-01-01T00:00:00Z',
                endDate: '2024-12-31T23:59:59Z',
                totalVolume: '50000',
                participants: 234,
                currentPrice: 0.65,
                creator: 'user123',
                outcomes: ['YES', 'NO']
            },
            {
                id: '2',
                title: 'AI Breakthrough in 2024',
                description: 'Will there be a major AI breakthrough announcement by a tech giant in 2024?',
                category: 'technology',
                status: 'active',
                createdAt: '2024-02-01T00:00:00Z',
                endDate: '2024-12-31T23:59:59Z',
                totalVolume: '25000',
                participants: 156,
                currentPrice: 0.72,
                creator: 'user456',
                outcomes: ['YES', 'NO']
            }
        ];
        res.json({
            success: true,
            data: markets,
            count: markets.length,
            pagination: {
                page: 1,
                limit: 10,
                total: markets.length
            }
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
            description: 'Will Bitcoin (BTC) reach or exceed $100,000 USD by December 31, 2024?',
            category: 'crypto',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            totalVolume: '50000',
            participants: 234,
            currentPrice: 0.65,
            creator: 'user123',
            outcomes: ['YES', 'NO'],
            positions: [
                { outcome: 'YES', shares: 150000, value: '97500' },
                { outcome: 'NO', shares: 80000, value: '28000' }
            ],
            recentTrades: [
                {
                    id: 'trade1',
                    outcome: 'YES',
                    shares: 100,
                    price: 0.65,
                    timestamp: new Date().toISOString(),
                    user: 'trader1'
                }
            ]
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
        const { title, description, category, endDate, outcomes = ['YES', 'NO'] } = req.body;
        const newMarket = {
            id: Date.now().toString(),
            title,
            description,
            category,
            endDate,
            outcomes,
            status: 'active',
            createdAt: new Date().toISOString(),
            totalVolume: '0',
            participants: 0,
            currentPrice: 0.5,
            creator: 'current_user'
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
router.post('/:id/bet', async (req, res) => {
    try {
        const { id } = req.params;
        const { outcome, amount, shares } = req.body;
        const bet = {
            id: Date.now().toString(),
            marketId: id,
            outcome,
            amount,
            shares,
            timestamp: new Date().toISOString(),
            user: 'current_user'
        };
        logger_1.logger.info('Bet placed:', bet);
        res.status(201).json({
            success: true,
            data: bet
        });
    }
    catch (error) {
        logger_1.logger.error('Error placing bet:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to place bet'
        });
    }
});
router.get('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        const analytics = {
            marketId: id,
            priceHistory: [
                { timestamp: '2024-01-01T00:00:00Z', price: 0.5 },
                { timestamp: '2024-06-01T00:00:00Z', price: 0.62 },
                { timestamp: new Date().toISOString(), price: 0.65 }
            ],
            volumeHistory: [
                { date: '2024-01-01', volume: 1000 },
                { date: '2024-06-01', volume: 25000 },
                { date: new Date().toISOString().split('T')[0], volume: 50000 }
            ],
            participantGrowth: [
                { date: '2024-01-01', count: 10 },
                { date: '2024-06-01', count: 120 },
                { date: new Date().toISOString().split('T')[0], count: 234 }
            ]
        };
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching market analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=markets.js.map