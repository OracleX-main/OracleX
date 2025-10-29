"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/profile', async (req, res) => {
    try {
        const user = {
            id: 'user123',
            username: 'john_trader',
            email: 'john@example.com',
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            balance: '1500.50',
            reputation: 85,
            joinedAt: '2024-01-15T10:30:00Z',
            stats: {
                marketsCreated: 5,
                marketsParticipated: 23,
                totalVolume: '5670.25',
                winRate: 0.67,
                avgReturn: 0.12
            },
            preferences: {
                notifications: true,
                emailAlerts: false,
                categories: ['crypto', 'technology', 'sports']
            }
        };
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile'
        });
    }
});
router.put('/profile', async (req, res) => {
    try {
        const { username, email, preferences } = req.body;
        const updatedUser = {
            id: 'user123',
            username: username || 'john_trader',
            email: email || 'john@example.com',
            preferences: preferences || {
                notifications: true,
                emailAlerts: false,
                categories: ['crypto', 'technology', 'sports']
            },
            updatedAt: new Date().toISOString()
        };
        logger_1.logger.info('User profile updated:', { userId: updatedUser.id });
        res.json({
            success: true,
            data: updatedUser
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user profile'
        });
    }
});
router.get('/portfolio', async (req, res) => {
    try {
        const portfolio = {
            totalValue: '2150.75',
            totalInvested: '1800.00',
            totalReturns: '350.75',
            returnPercentage: 19.49,
            positions: [
                {
                    marketId: '1',
                    marketTitle: 'Bitcoin Price Above $100,000 by End of 2024',
                    outcome: 'YES',
                    shares: 100,
                    averagePrice: 0.62,
                    currentPrice: 0.65,
                    value: '65.00',
                    unrealizedPnL: '3.00',
                    unrealizedPnLPercentage: 4.84
                },
                {
                    marketId: '2',
                    marketTitle: 'AI Breakthrough in 2024',
                    outcome: 'NO',
                    shares: 50,
                    averagePrice: 0.45,
                    currentPrice: 0.28,
                    value: '14.00',
                    unrealizedPnL: '-8.50',
                    unrealizedPnLPercentage: -37.78
                }
            ],
            history: [
                {
                    marketId: '3',
                    marketTitle: 'Ethereum ETF Approval',
                    outcome: 'YES',
                    shares: 75,
                    entryPrice: 0.30,
                    exitPrice: 0.95,
                    pnl: '48.75',
                    pnlPercentage: 216.67,
                    resolvedAt: '2024-05-15T14:20:00Z'
                }
            ]
        };
        res.json({
            success: true,
            data: portfolio
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user portfolio:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user portfolio'
        });
    }
});
router.get('/transactions', async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const transactions = [
            {
                id: 'tx_1',
                type: 'BUY',
                marketId: '1',
                marketTitle: 'Bitcoin Price Above $100,000 by End of 2024',
                outcome: 'YES',
                shares: 50,
                price: 0.65,
                amount: '32.50',
                fee: '0.65',
                timestamp: new Date().toISOString(),
                status: 'completed',
                txHash: '0xabcdef1234567890...'
            },
            {
                id: 'tx_2',
                type: 'SELL',
                marketId: '3',
                marketTitle: 'Ethereum ETF Approval',
                outcome: 'YES',
                shares: 75,
                price: 0.95,
                amount: '71.25',
                fee: '1.43',
                timestamp: '2024-05-15T14:20:00Z',
                status: 'completed',
                txHash: '0x1234567890abcdef...'
            }
        ];
        const filteredTransactions = type && typeof type === 'string'
            ? transactions.filter(tx => tx.type === type.toUpperCase())
            : transactions;
        res.json({
            success: true,
            data: filteredTransactions,
            count: filteredTransactions.length,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: filteredTransactions.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user transactions'
        });
    }
});
router.get('/notifications', async (req, res) => {
    try {
        const { unread = false } = req.query;
        const notifications = [
            {
                id: 'notif_1',
                type: 'MARKET_RESOLVED',
                title: 'Market Resolved',
                message: 'Your position in "Bitcoin Price Above $100,000" has been resolved. You won!',
                marketId: '1',
                read: false,
                timestamp: new Date().toISOString()
            },
            {
                id: 'notif_2',
                type: 'MARKET_EXPIRING',
                title: 'Market Expiring Soon',
                message: 'The market "AI Breakthrough in 2024" expires in 24 hours.',
                marketId: '2',
                read: true,
                timestamp: '2024-12-30T12:00:00Z'
            },
            {
                id: 'notif_3',
                type: 'WITHDRAWAL_COMPLETE',
                title: 'Withdrawal Complete',
                message: 'Your withdrawal of 50 ORX tokens has been processed.',
                read: true,
                timestamp: '2024-12-29T16:45:00Z'
            }
        ];
        const filteredNotifications = unread === 'true'
            ? notifications.filter(n => !n.read)
            : notifications;
        res.json({
            success: true,
            data: filteredNotifications,
            count: filteredNotifications.length,
            unreadCount: notifications.filter(n => !n.read).length
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user notifications'
        });
    }
});
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        logger_1.logger.info(`Notification ${id} marked as read`);
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = {
            currentUser: {
                rank: 15,
                username: 'john_trader',
                reputation: 85,
                totalReturns: '350.75',
                winRate: 0.67
            },
            topUsers: [
                {
                    rank: 1,
                    username: 'crypto_oracle',
                    reputation: 98,
                    totalReturns: '2150.50',
                    winRate: 0.89
                },
                {
                    rank: 2,
                    username: 'market_master',
                    reputation: 95,
                    totalReturns: '1890.25',
                    winRate: 0.85
                },
                {
                    rank: 3,
                    username: 'prediction_pro',
                    reputation: 92,
                    totalReturns: '1675.75',
                    winRate: 0.82
                }
            ]
        };
        res.json({
            success: true,
            data: leaderboard
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user leaderboard'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map