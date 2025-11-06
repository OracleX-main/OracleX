import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get platform analytics overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Get counts and aggregates from database
    const [
      totalMarkets,
      activeMarkets,
      resolvedMarkets,
      totalUsers,
      totalVolumeResult,
      recentTransactions
    ] = await Promise.all([
      prisma.market.count(),
      prisma.market.count({ where: { status: 'ACTIVE' } }),
      prisma.market.count({ where: { status: 'RESOLVED' } }),
      prisma.user.count(),
      prisma.market.aggregate({ _sum: { totalVolume: true } }),
      prisma.prediction.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        select: {
          amount: true
        }
      })
    ]);

    // Calculate 24h volume
    const volume24h = recentTransactions.reduce(
      (sum, pred) => sum + parseFloat(pred.amount.toString()),
      0
    );

    // Get active users (users who made predictions in last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        predictions: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    // Calculate average market duration
    const resolvedMarketsData = await prisma.market.findMany({
      where: { status: 'RESOLVED', resolutionDate: { not: null } },
      select: {
        createdAt: true,
        resolutionDate: true
      }
    });

    const avgMarketDuration = resolvedMarketsData.length > 0
      ? resolvedMarketsData.reduce((sum, m) => {
          const duration = m.resolutionDate!.getTime() - m.createdAt.getTime();
          return sum + duration / (1000 * 60 * 60 * 24); // Convert to days
        }, 0) / resolvedMarketsData.length
      : 0;

    // Calculate resolution accuracy and dispute rate from resolutions
    const resolutions = await prisma.resolution.findMany({
      select: {
        humanVerified: true,
        confidence: true
      }
    });

    const resolutionAccuracy = resolutions.length > 0
      ? resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length
      : 0;

    const disputes = resolutions.filter(r => !r.humanVerified).length;
    const disputeRate = resolutions.length > 0 ? disputes / resolutions.length : 0;

    const overview = {
      totalMarkets,
      activeMarkets,
      resolvedMarkets,
      totalUsers,
      activeUsers,
      totalVolume: totalVolumeResult._sum.totalVolume?.toString() || '0',
      volume24h: volume24h.toString(),
      avgMarketDuration: parseFloat(avgMarketDuration.toFixed(2)),
      resolutionAccuracy: parseFloat(resolutionAccuracy.toFixed(4)),
      disputeRate: parseFloat(disputeRate.toFixed(4)),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get market analytics
router.get('/markets', async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    // TODO: Implement actual market analytics
    const analytics = {
      period,
      marketCreation: [
        { date: '2024-10-23', count: 12 },
        { date: '2024-10-24', count: 15 },
        { date: '2024-10-25', count: 8 },
        { date: '2024-10-26', count: 18 },
        { date: '2024-10-27', count: 14 },
        { date: '2024-10-28', count: 11 },
        { date: '2024-10-29', count: 9 }
      ],
      categoryDistribution: [
        { category: 'crypto', count: 45, percentage: 28.8 },
        { category: 'sports', count: 38, percentage: 24.4 },
        { category: 'politics', count: 32, percentage: 20.5 },
        { category: 'technology', count: 25, percentage: 16.0 },
        { category: 'entertainment', count: 16, percentage: 10.3 }
      ],
      avgParticipation: 23.5,
      avgVolume: '8450.75',
      resolutionTime: {
        avg: 4.2, // hours
        median: 3.8,
        p95: 12.5
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market analytics'
    });
  }
});

// Get user analytics
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // TODO: Implement actual user analytics
    const analytics = {
      period,
      userGrowth: [
        { date: '2024-10-01', newUsers: 45, totalUsers: 2145 },
        { date: '2024-10-08', newUsers: 52, totalUsers: 2197 },
        { date: '2024-10-15', newUsers: 38, totalUsers: 2235 },
        { date: '2024-10-22', newUsers: 67, totalUsers: 2302 },
        { date: '2024-10-29', newUsers: 43, totalUsers: 2345 }
      ],
      activityMetrics: {
        dailyActiveUsers: 1234,
        weeklyActiveUsers: 1890,
        monthlyActiveUsers: 2100,
        avgSessionDuration: 24.5, // minutes
        avgMarketsPerUser: 3.8
      },
      retentionRates: {
        day1: 0.78,
        day7: 0.45,
        day30: 0.23
      },
      topTraders: [
        { username: 'crypto_oracle', volume: '15670.25', winRate: 0.89 },
        { username: 'market_master', volume: '12450.80', winRate: 0.85 },
        { username: 'prediction_pro', volume: '11230.15', winRate: 0.82 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
});

// Get trading volume analytics
router.get('/volume', async (req: Request, res: Response) => {
  try {
    const { period = '7d', granularity = 'daily' } = req.query;
    
    // TODO: Implement actual volume analytics
    const analytics = {
      period,
      granularity,
      volumeData: [
        { timestamp: '2024-10-23T00:00:00Z', volume: '45670.25', trades: 234 },
        { timestamp: '2024-10-24T00:00:00Z', volume: '52340.80', trades: 267 },
        { timestamp: '2024-10-25T00:00:00Z', volume: '38920.15', trades: 198 },
        { timestamp: '2024-10-26T00:00:00Z', volume: '67580.90', trades: 345 },
        { timestamp: '2024-10-27T00:00:00Z', volume: '44230.70', trades: 221 },
        { timestamp: '2024-10-28T00:00:00Z', volume: '51890.35', trades: 289 },
        { timestamp: '2024-10-29T00:00:00Z', volume: '39850.60', trades: 205 }
      ],
      totalVolume: '340542.75',
      totalTrades: 1759,
      avgTradeSize: '193.60',
      peakVolume: {
        amount: '67580.90',
        timestamp: '2024-10-26T00:00:00Z'
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching volume analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch volume analytics'
    });
  }
});

// Get oracle performance analytics
router.get('/oracle', async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual oracle analytics
    const analytics = {
      totalResolutions: 145,
      accuracyRate: 0.94,
      avgResolutionTime: 4.2, // hours
      avgConfidence: 0.87,
      disputeRate: 0.03,
      agentPerformance: {
        dataFetcher: {
          uptime: 0.998,
          successRate: 0.996,
          avgResponseTime: 1200
        },
        validator: {
          uptime: 0.999,
          successRate: 0.998,
          avgResponseTime: 800
        },
        arbiter: {
          uptime: 1.0,
          successRate: 1.0,
          avgResponseTime: 1500
        },
        confidenceScorer: {
          uptime: 0.997,
          successRate: 0.995,
          avgResponseTime: 600
        }
      },
      resolutionTimeline: [
        { date: '2024-10-23', resolutions: 8, avgTime: 3.8 },
        { date: '2024-10-24', resolutions: 12, avgTime: 4.2 },
        { date: '2024-10-25', resolutions: 6, avgTime: 5.1 },
        { date: '2024-10-26', resolutions: 15, avgTime: 3.9 },
        { date: '2024-10-27', resolutions: 9, avgTime: 4.6 },
        { date: '2024-10-28', resolutions: 11, avgTime: 4.0 },
        { date: '2024-10-29', resolutions: 7, avgTime: 4.3 }
      ]
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching oracle analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch oracle analytics'
    });
  }
});

// Get financial analytics
router.get('/financial', async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual financial analytics
    const analytics = {
      totalValueLocked: '1250000.50',
      totalFees: '12750.25',
      revenueSharing: {
        platform: '6375.13',
        stakers: '3825.08',
        development: '2550.05'
      },
      tokenMetrics: {
        totalSupply: '100000000',
        circulatingSupply: '75000000',
        marketCap: '15000000.00',
        price: '0.20'
      },
      liquidityMetrics: {
        totalLiquidity: '2500000.00',
        utilizationRate: 0.50,
        avgSpread: 0.02
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching financial analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial analytics'
    });
  }
});

export default router;