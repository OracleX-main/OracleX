import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all prediction markets
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build where clause for filtering
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.market.count({ where });
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch markets with relations
    const markets = await prisma.market.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true
          }
        },
        outcomes: {
          select: {
            id: true,
            name: true,
            totalStaked: true,
            probability: true,
            isWinning: true
          }
        },
        predictions: {
          select: {
            userId: true
          },
          distinct: ['userId']
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedMarkets = markets.map(market => ({
      id: market.id,
      title: market.title,
      description: market.description,
      category: market.category,
      subcategory: market.subcategory,
      status: market.status,
      createdAt: market.createdAt.toISOString(),
      endDate: market.endDate.toISOString(),
      resolutionDate: market.resolutionDate?.toISOString(),
      totalVolume: market.totalVolume.toString(),
      totalStaked: market.totalStaked.toString(),
      participants: market.predictions.length,
      confidence: market.confidence,
      contractAddress: market.contractAddress,
      isVerified: market.isVerified,
      creator: {
        id: market.creator.id,
        walletAddress: market.creator.walletAddress,
        username: market.creator.username,
        reputation: market.creator.reputation
      },
      outcomes: market.outcomes.map(outcome => ({
        id: outcome.id,
        name: outcome.name,
        totalStaked: outcome.totalStaked.toString(),
        probability: outcome.probability,
        isWinning: outcome.isWinning
      }))
    }));

    res.json({
      success: true,
      data: formattedMarkets,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    logger.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get market categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // Get unique categories from actual markets in database
    const categories = await prisma.market.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category).filter(Boolean);

    res.json({
      success: true,
      data: categoryList.length > 0 ? categoryList : [
        'Cryptocurrency',
        'Sports',
        'Politics',
        'Technology',
        'Economics',
        'Entertainment',
        'Science',
        'Weather'
      ]
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get trending markets
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    // Fetch trending markets (active, sorted by volume and recency)
    const markets = await prisma.market.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: [
        { totalVolume: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        creator: {
          select: {
            walletAddress: true,
            username: true
          }
        },
        outcomes: {
          select: {
            id: true,
            name: true,
            totalStaked: true,
            probability: true
          }
        },
        _count: {
          select: {
            predictions: true
          }
        }
      }
    });

    const formattedMarkets = markets.map(market => ({
      id: market.id,
      title: market.title,
      description: market.description,
      category: market.category,
      endDate: market.endDate.toISOString(),
      totalVolume: market.totalVolume.toString(),
      totalStaked: market.totalStaked.toString(),
      participants: market._count.predictions,
      status: market.status,
      yesOdds: market.outcomes.find(o => o.name.toLowerCase() === 'yes')?.probability || 50,
      noOdds: market.outcomes.find(o => o.name.toLowerCase() === 'no')?.probability || 50,
      poolSize: parseFloat(market.totalVolume.toString()),
      confidenceScore: market.confidence || 0,
      creator: market.creator
    }));

    res.json({
      success: true,
      data: formattedMarkets
    });
  } catch (error) {
    logger.error('Error fetching trending markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending markets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific market by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
            avatar: true
          }
        },
        outcomes: {
          include: {
            predictions: {
              select: {
                amount: true,
                odds: true,
                createdAt: true,
                user: {
                  select: {
                    walletAddress: true,
                    username: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            }
          }
        },
        predictions: {
          include: {
            user: {
              select: {
                walletAddress: true,
                username: true
              }
            },
            outcome: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        resolutions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    // Format the response with full market details
    const formattedMarket = {
      id: market.id,
      title: market.title,
      description: market.description,
      category: market.category,
      subcategory: market.subcategory,
      status: market.status,
      createdAt: market.createdAt.toISOString(),
      endDate: market.endDate.toISOString(),
      resolutionDate: market.resolutionDate?.toISOString(),
      totalVolume: market.totalVolume.toString(),
      totalStaked: market.totalStaked.toString(),
      participants: new Set(market.predictions.map(p => p.userId)).size,
      confidence: market.confidence,
      contractAddress: market.contractAddress,
      isVerified: market.isVerified,
      outcome: market.outcome,
      creator: market.creator,
      outcomes: market.outcomes.map(outcome => ({
        id: outcome.id,
        name: outcome.name,
        totalStaked: outcome.totalStaked.toString(),
        probability: outcome.probability,
        isWinning: outcome.isWinning,
        recentTrades: outcome.predictions.map(pred => ({
          amount: pred.amount.toString(),
          odds: pred.odds,
          timestamp: pred.createdAt.toISOString(),
          user: pred.user.username || pred.user.walletAddress.slice(0, 10) + '...'
        }))
      })),
      recentActivity: market.predictions.map(pred => ({
        id: pred.id,
        userId: pred.userId,
        username: pred.user.username || pred.user.walletAddress.slice(0, 10) + '...',
        outcome: pred.outcome.name,
        amount: pred.amount.toString(),
        odds: pred.odds,
        timestamp: pred.createdAt.toISOString()
      })),
      resolution: market.resolutions[0] ? {
        outcome: market.resolutions[0].outcome,
        confidence: market.resolutions[0].confidence,
        resolvedAt: market.resolutions[0].createdAt.toISOString(),
        humanVerified: market.resolutions[0].humanVerified
      } : null
    };

    res.json({
      success: true,
      data: formattedMarket
    });
  } catch (error) {
    logger.error('Error fetching market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new market (requires authentication)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      endDate,
      outcomes = ['YES', 'NO'],
      contractAddress,
      metadata
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, category, endDate'
      });
    }

    // Get user ID from auth context
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Create market in database
    const market = await prisma.market.create({
      data: {
        title,
        description,
        category,
        subcategory,
        endDate: new Date(endDate),
        contractAddress,
        metadata: metadata ? JSON.stringify(metadata) : null,
        creatorId: userId,
        outcomes: {
          create: outcomes.map((name: string) => ({
            name,
            probability: 1 / outcomes.length
          }))
        }
      },
      include: {
        outcomes: true,
        creator: {
          select: {
            id: true,
            walletAddress: true,
            username: true
          }
        }
      }
    });

    logger.info('Market created:', { marketId: market.id, userId });

    res.status(201).json({
      success: true,
      data: {
        id: market.id,
        title: market.title,
        description: market.description,
        category: market.category,
        subcategory: market.subcategory,
        endDate: market.endDate.toISOString(),
        contractAddress: market.contractAddress,
        status: market.status,
        outcomes: market.outcomes.map(o => ({
          id: o.id,
          name: o.name,
          probability: o.probability
        })),
        creator: market.creator,
        createdAt: market.createdAt.toISOString()
      }
    });
  } catch (error) {
    logger.error('Error creating market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Place bet on market (requires authentication)
router.post('/:id/bet', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { outcomeId, amount, odds, txHash } = req.body;
    
    // Validate required fields
    if (!outcomeId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: outcomeId, amount'
      });
    }

    // Get user ID from auth context
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Verify market exists and is active
    const market = await prisma.market.findUnique({
      where: { id },
      include: { outcomes: true }
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    if (market.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Market is not active'
      });
    }

    // Verify outcome exists for this market
    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) {
      return res.status(400).json({
        success: false,
        error: 'Invalid outcome for this market'
      });
    }

    const amountDecimal = parseFloat(amount);
    const oddsValue = odds || outcome.probability;
    const potential = amountDecimal / oddsValue;

    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        marketId: id,
        outcomeId,
        amount: amountDecimal,
        odds: oddsValue,
        potential,
        txHash,
        status: 'ACTIVE'
      },
      include: {
        outcome: true,
        market: {
          select: {
            title: true
          }
        }
      }
    });

    // Update market and outcome totals
    await prisma.$transaction([
      prisma.market.update({
        where: { id },
        data: {
          totalStaked: {
            increment: amountDecimal
          },
          totalVolume: {
            increment: amountDecimal
          }
        }
      }),
      prisma.outcome.update({
        where: { id: outcomeId },
        data: {
          totalStaked: {
            increment: amountDecimal
          }
        }
      })
    ]);

    logger.info('Bet placed:', { predictionId: prediction.id, userId, marketId: id });

    res.status(201).json({
      success: true,
      data: {
        id: prediction.id,
        marketId: prediction.marketId,
        marketTitle: prediction.market.title,
        outcome: prediction.outcome.name,
        amount: prediction.amount.toString(),
        odds: prediction.odds,
        potential: prediction.potential.toString(),
        timestamp: prediction.createdAt.toISOString(),
        txHash: prediction.txHash
      }
    });
  } catch (error) {
    logger.error('Error placing bet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place bet',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get market analytics
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify market exists
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        analytics: {
          orderBy: {
            date: 'asc'
          }
        },
        predictions: {
          include: {
            outcome: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    // Calculate price history from predictions
    const priceHistory = market.predictions.reduce((acc: any[], pred) => {
      const timestamp = pred.createdAt.toISOString();
      acc.push({
        timestamp,
        outcome: pred.outcome.name,
        odds: pred.odds
      });
      return acc;
    }, []);

    // Group predictions by date for volume history
    const volumeByDate = market.predictions.reduce((acc: any, pred) => {
      const date = pred.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(pred.amount.toString());
      return acc;
    }, {});

    const volumeHistory = Object.entries(volumeByDate).map(([date, volume]) => ({
      date,
      volume
    }));

    // Calculate unique participants over time
    const participantsByDate = market.predictions.reduce((acc: any, pred) => {
      const date = pred.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(pred.userId);
      return acc;
    }, {});

    const participantGrowth = Object.entries(participantsByDate).map(([date, users]) => ({
      date,
      count: (users as Set<string>).size
    }));

    const analytics = {
      marketId: id,
      priceHistory,
      volumeHistory,
      participantGrowth,
      totalVolume: market.totalVolume.toString(),
      totalStaked: market.totalStaked.toString(),
      currentParticipants: new Set(market.predictions.map(p => p.userId)).size,
      analytics: market.analytics.map(a => ({
        date: a.date.toISOString(),
        totalVolume: a.totalVolume.toString(),
        totalStaked: a.totalStaked.toString(),
        uniqueUsers: a.uniqueUsers,
        avgPrediction: a.avgPrediction,
        volatility: a.volatility,
        momentum: a.momentum,
        sentiment: a.sentiment
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching market analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;