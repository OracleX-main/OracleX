import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get all user predictions for stats calculation
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        market: {
          select: {
            status: true
          }
        }
      }
    });

    // Get markets created by user
    const marketsCreated = await prisma.market.count({
      where: { creatorId: userId }
    });

    // Calculate stats
    const totalInvested = predictions.reduce((sum: number, p: any) => 
      sum + parseFloat(p.amount.toString()), 0);
    
    const wonPredictions = predictions.filter((p: any) => p.status === 'WON');
    const lostPredictions = predictions.filter((p: any) => p.status === 'LOST');
    const resolvedPredictions = [...wonPredictions, ...lostPredictions];
    
    const totalReturns = wonPredictions.reduce((sum: number, p: any) => 
      sum + parseFloat(p.potential?.toString() || '0'), 0);
    
    const winRate = resolvedPredictions.length > 0 
      ? wonPredictions.length / resolvedPredictions.length 
      : 0;
    
    const avgReturn = totalInvested > 0 
      ? (totalReturns - totalInvested) / totalInvested 
      : 0;

    // Get unique markets participated in
    const uniqueMarkets = new Set(predictions.map(p => p.marketId));

    const profileData = {
      id: user.id,
      walletAddress: user.walletAddress,
      reputation: user.reputation || 0,
      joinedAt: user.createdAt.toISOString(),
      stats: {
        marketsCreated: marketsCreated,
        marketsParticipated: uniqueMarkets.size,
        totalPredictions: predictions.length,
        activePredictions: predictions.filter(p => p.market.status === 'ACTIVE').length,
        totalVolume: totalInvested.toFixed(2),
        totalEarned: totalReturns.toFixed(2),
        winRate: parseFloat((winRate * 100).toFixed(2)),
        avgReturn: parseFloat((avgReturn * 100).toFixed(2))
      }
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { username, email, preferences } = req.body;
    
    // TODO: Implement actual profile update
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

    logger.info('User profile updated:', { userId: updatedUser.id });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Get user portfolio
router.get('/portfolio', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get all user predictions with market details
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        market: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true
          }
        },
        outcome: {
          select: {
            id: true,
            name: true,
            probability: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate portfolio stats
    const totalInvested = predictions.reduce((sum: number, p: any) => 
      sum + parseFloat(p.amount.toString()), 0);
    
    const activePredictions = predictions.filter((p: any) => 
      p.market.status === 'ACTIVE');
    
    const resolvedPredictions = predictions.filter((p: any) => 
      p.market.status === 'RESOLVED');
    
    const wonPredictions = predictions.filter((p: any) => 
      p.status === 'WON');
    
    const totalReturns = wonPredictions.reduce((sum: number, p: any) => 
      sum + parseFloat(p.potential?.toString() || '0'), 0);
    
    const totalValue = totalInvested + totalReturns;
    const returnPercentage = totalInvested > 0 
      ? ((totalReturns / totalInvested) * 100) 
      : 0;

    // Format active positions
    const positions = activePredictions.map((pred: any) => ({
      marketId: pred.market.id,
      marketTitle: pred.market.title,
      outcome: pred.outcome.name,
      shares: parseFloat(pred.amount.toString()),
      averagePrice: parseFloat(pred.odds.toString()),
      currentPrice: pred.outcome.probability,
      value: parseFloat(pred.amount.toString()) * pred.outcome.probability,
      unrealizedPnL: (parseFloat(pred.amount.toString()) * pred.outcome.probability) - parseFloat(pred.amount.toString()),
      status: pred.status
    }));

    // Format resolved positions (history)
    const history = resolvedPredictions.map((pred: any) => ({
      marketId: pred.market.id,
      marketTitle: pred.market.title,
      outcome: pred.outcome.name,
      shares: parseFloat(pred.amount.toString()),
      entryPrice: parseFloat(pred.odds.toString()),
      pnl: pred.status === 'WON' ? parseFloat(pred.potential?.toString() || '0') : -parseFloat(pred.amount.toString()),
      pnlPercentage: pred.status === 'WON' 
        ? ((parseFloat(pred.potential?.toString() || '0') - parseFloat(pred.amount.toString())) / parseFloat(pred.amount.toString())) * 100
        : -100,
      resolvedAt: pred.updatedAt.toISOString(),
      status: pred.status
    }));

    const portfolio = {
      totalValue: totalValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      totalReturns: totalReturns.toFixed(2),
      returnPercentage: returnPercentage.toFixed(2),
      activePredictions: activePredictions.length,
      resolvedPredictions: resolvedPredictions.length,
      wonPredictions: wonPredictions.length,
      positions,
      history
    };

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    logger.error('Error fetching user portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user portfolio',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user transaction history
router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { page = 1, limit = 20, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get user predictions as transactions
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      include: {
        market: {
          select: {
            id: true,
            title: true
          }
        },
        outcome: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: Number(limit)
    });

    const totalCount = await prisma.prediction.count({
      where: { userId }
    });

    const transactions = predictions.map((pred: any) => ({
      id: pred.id,
      type: 'PREDICTION',
      marketId: pred.market.id,
      marketTitle: pred.market.title,
      outcome: pred.outcome.name,
      amount: parseFloat(pred.amount.toString()),
      odds: parseFloat(pred.odds.toString()),
      potential: parseFloat(pred.potential?.toString() || '0'),
      timestamp: pred.createdAt.toISOString(),
      status: pred.status,
      txHash: pred.transactionHash
    }));

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount
      }
    });
  } catch (error) {
    logger.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user transactions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const { unread = false } = req.query;
    
    // TODO: Implement actual notification fetching
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
  } catch (error) {
    logger.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user notifications'
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement actual notification update
    logger.info(`Notification ${id} marked as read`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Get user leaderboard position
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = 50, period = 'all' } = req.query;

    // Calculate date filter based on period
    let dateFilter: Date | undefined;
    if (period === 'week') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === 'month') {
      dateFilter = new Date();
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    }

    // Get all users with their prediction stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        reputation: true,
        totalWinnings: true,
        predictions: {
          where: dateFilter ? {
            createdAt: {
              gte: dateFilter
            }
          } : undefined,
          select: {
            status: true,
            amount: true,
            potential: true
          }
        }
      }
    });

    // Calculate stats for each user
    const leaderboardData = users.map(user => {
      const predictions = user.predictions;
      const totalPredictions = predictions.length;
      const wonPredictions = predictions.filter((p: any) => p.status === 'WON').length;
      const totalEarned = predictions
        .filter((p: any) => p.status === 'WON')
        .reduce((sum: number, p: any) => sum + parseFloat(p.potential?.toString() || '0'), 0);
      
      const totalInvested = predictions.reduce((sum: number, p: any) => 
        sum + parseFloat(p.amount.toString()), 0);
      
      const winRate = totalPredictions > 0 ? wonPredictions / totalPredictions : 0;
      const accuracy = winRate; // For now, accuracy = win rate

      return {
        userId: user.id,
        walletAddress: user.walletAddress,
        reputation: user.reputation,
        totalEarned,
        totalPredictions,
        winRate: parseFloat((winRate * 100).toFixed(2)),
        accuracyScore: parseFloat((accuracy * 100).toFixed(2)),
        totalWinnings: parseFloat(user.totalWinnings.toString())
      };
    });

    // Sort by total earned (descending)
    leaderboardData.sort((a, b) => b.totalEarned - a.totalEarned);

    // Add rank and limit results
    const rankedLeaderboard = leaderboardData
      .slice(0, Number(limit))
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

    res.json({
      success: true,
      data: rankedLeaderboard,
      count: rankedLeaderboard.length
    });
  } catch (error) {
    logger.error('Error fetching user leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user leaderboard',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;