import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { blockchainService } from './blockchain';

const prisma = new PrismaClient();

interface MarketCreatedEvent {
  marketId: bigint;
  creator: string;
  question: string;
  endTime: bigint;
}

export class BlockchainSyncService {
  private provider: ethers.JsonRpcProvider;
  private marketFactoryContract: ethers.Contract;
  private isRunning: boolean = false;

  constructor() {
    // Use fallback RPC endpoints if primary fails
    const rpcUrls = [
      process.env.BSC_RPC_URL,
      'https://bsc-testnet-rpc.publicnode.com',
      'https://bsc-testnet.drpc.org',
      'https://endpoints.omniatech.io/v1/bsc/testnet/public',
      'https://data-seed-prebsc-2-s1.binance.org:8545'
    ].filter(Boolean);

    const rpcUrl = rpcUrls[0] || 'https://bsc-testnet-rpc.publicnode.com';
    
    this.provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: ethers.Network.from({
        name: 'bsc-testnet',
        chainId: 97
      })
    });
    
    logger.info(`Using RPC endpoint: ${rpcUrl}`);
    
    const marketFactoryAddress = process.env.MARKET_FACTORY_ADDRESS;
    if (!marketFactoryAddress) {
      logger.warn('⚠️ MARKET_FACTORY_ADDRESS not set - blockchain sync will be disabled');
      logger.info('💡 Set MARKET_FACTORY_ADDRESS in environment to enable blockchain sync');
      throw new Error('MARKET_FACTORY_ADDRESS not configured');
    }

    // Simplified ABI for just the events we need
    const abi = [
      'event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 endTime, string category, uint8 oracleType)',
      'event PredictionPlaced(uint256 indexed marketId, address indexed user, uint8 outcome, uint256 amount)',
      'event MarketResolved(uint256 indexed marketId, uint8 winningOutcome, uint256 resolutionTime)',
      'function getMarket(uint256 marketId) view returns (string question, uint256 endTime, bool resolved, uint8 outcome, uint256 totalStaked, address creator, string category)'
    ];

    this.marketFactoryContract = new ethers.Contract(
      marketFactoryAddress,
      abi,
      this.provider
    );
  }

  /**
   * Start listening to blockchain events and syncing to database
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Blockchain sync service is already running');
      return;
    }

    try {
      logger.info('Starting blockchain sync service...');
      
      // Test network connectivity first
      try {
        const network = await this.provider.getNetwork();
        logger.info(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      } catch (networkError) {
        logger.error('Failed to connect to blockchain network:', networkError);
        logger.warn('⚠️ Blockchain sync service disabled due to network error');
        logger.info('💡 Backend will continue running without blockchain sync');
        return;
      }

      this.isRunning = true;

      // Check if historical sync is enabled (default: false to avoid rate limits)
      const enableHistoricalSync = process.env.ENABLE_HISTORICAL_SYNC === 'true';
      
      if (enableHistoricalSync) {
        // Sync historical data first
        await this.syncHistoricalData();
      } else {
        logger.info('Historical sync disabled. Only listening for new events.');
        logger.info('Set ENABLE_HISTORICAL_SYNC=true in .env to enable historical sync.');
      }

      // Then listen to new events
      this.listenToEvents();
    } catch (error) {
      logger.error('Error starting blockchain sync service:', error);
      logger.warn('⚠️ Backend will continue running without blockchain sync');
      this.isRunning = false;
    }
  }

  /**
   * Stop the sync service
   */
  stop() {
    this.isRunning = false;
    this.marketFactoryContract.removeAllListeners();
    logger.info('Blockchain sync service stopped');
  }

  /**
   * Sync historical market data from blockchain to database
   */
  private async syncHistoricalData() {
    try {
      logger.info('Syncing historical blockchain data...');

      // Get the latest block synced from database
      const latestMarket = await prisma.market.findFirst({
        where: { contractAddress: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const currentBlock = await this.provider.getBlockNumber();
      
      // Start from last sync or use a recent block to avoid rate limits
      let fromBlock: number;
      if (latestMarket) {
        fromBlock = await this.getBlockNumberByTimestamp(latestMarket.createdAt);
      } else {
        // If no markets exist, only sync last 10,000 blocks (~8 hours on BSC)
        // This avoids rate limits while still catching recent events
        const deploymentBlock = parseInt(process.env.DEPLOYMENT_BLOCK || '0');
        const recentBlocks = 10000;
        fromBlock = Math.max(deploymentBlock, currentBlock - recentBlocks);
      }

      logger.info(`Syncing from block ${fromBlock} to ${currentBlock}`);

      // Chunk size to avoid rate limits (BSC allows ~2000 blocks per query)
      const CHUNK_SIZE = 2000;
      const totalBlocks = currentBlock - fromBlock;
      
      if (totalBlocks > CHUNK_SIZE) {
        logger.info(`Large block range detected. Syncing in chunks of ${CHUNK_SIZE} blocks...`);
      }

      let allEvents: any[] = [];
      
      // Query in chunks to avoid rate limits
      for (let start = fromBlock; start <= currentBlock; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, currentBlock);
        
        try {
          const filter = this.marketFactoryContract.filters.MarketCreated();
          const events = await this.marketFactoryContract.queryFilter(
            filter,
            start,
            end
          );
          
          allEvents = allEvents.concat(events);
          
          if (totalBlocks > CHUNK_SIZE) {
            logger.info(`Synced blocks ${start} to ${end} - Found ${events.length} events`);
          }
          
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (chunkError) {
          logger.warn(`Failed to sync blocks ${start} to ${end}:`, chunkError);
          // Continue with next chunk even if one fails
        }
      }

      logger.info(`Found ${allEvents.length} MarketCreated events total`);

      for (const event of allEvents) {
        await this.processMarketCreatedEvent(event);
      }

      logger.info('Historical data sync completed');
    } catch (error) {
      logger.error('Error syncing historical data:', error);
    }
  }

  /**
   * Listen to real-time blockchain events
   */
  private listenToEvents() {
    logger.info('Listening for blockchain events...');

    // Add error handler for event listener issues
    const errorHandler = (error: any) => {
      // Ignore common "filter not found" errors from RPC nodes
      if (error?.message?.includes('filter not found')) {
        return; // Silently ignore
      }
      logger.error('Event listener error:', error);
    };

    // Listen for new markets
    this.marketFactoryContract.on('MarketCreated', async (marketId, creator, question, endTime, category, oracleType, event) => {
      try {
        logger.info(`New MarketCreated event: Market ID ${marketId}`);
        await this.processMarketCreatedEvent(event);
      } catch (error) {
        logger.error('Error processing MarketCreated event:', error);
      }
    });

    // Listen for predictions
    this.marketFactoryContract.on('PredictionPlaced', async (marketId, user, outcome, amount, event) => {
      try {
        logger.info(`New PredictionPlaced event: Market ${marketId}, User ${user}`);
        await this.processPredictionPlacedEvent(event);
      } catch (error) {
        logger.error('Error processing PredictionPlaced event:', error);
      }
    });

    // Listen for resolutions
    this.marketFactoryContract.on('MarketResolved', async (marketId, winningOutcome, resolutionTime, event) => {
      try {
        logger.info(`New MarketResolved event: Market ${marketId}`);
        await this.processMarketResolvedEvent(event);
      } catch (error) {
        logger.error('Error processing MarketResolved event:', error);
      }
    });

    // Add global error handler
    this.provider.on('error', errorHandler);
  }

  /**
   * Process MarketCreated event and save to database
   */
  private async processMarketCreatedEvent(event: any) {
    try {
      const args = event.args;
      if (!args) return;

      const marketId = args.marketId.toString();
      const creator = args.creator.toLowerCase();
      const question = args.question;
      const endTime = new Date(Number(args.endTime) * 1000);
      const category = args.category || 'Uncategorized';

      // Check if market already exists
      const existingMarket = await prisma.market.findFirst({
        where: { contractAddress: marketId }
      });

      if (existingMarket) {
        logger.info(`Market ${marketId} already exists in database`);
        return;
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: creator }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: creator
          }
        });
        logger.info(`Created new user: ${creator}`);
      }

      // Fetch additional market data from blockchain
      const marketData = await this.marketFactoryContract.getMarket(marketId);

      // Create market in database
      const market = await prisma.market.create({
        data: {
          title: question,
          description: question,
          category: category,
          endDate: endTime,
          contractAddress: marketId,
          creatorId: user.id,
          status: 'ACTIVE',
          totalStaked: marketData.totalStaked ? marketData.totalStaked.toString() : '0',
          outcomes: {
            create: [
              { name: 'YES', probability: 0.5 },
              { name: 'NO', probability: 0.5 }
            ]
          }
        },
        include: { outcomes: true }
      });

      logger.info(`Market created in database: ${market.id} (Blockchain ID: ${marketId})`);
    } catch (error) {
      logger.error('Error processing MarketCreated event:', error);
    }
  }

  /**
   * Process PredictionPlaced event and save to database
   */
  private async processPredictionPlacedEvent(event: any) {
    try {
      const args = event.args;
      if (!args) return;

      const marketId = args.marketId.toString();
      const userAddress = args.user.toLowerCase();
      const outcomeIndex = Number(args.outcome);
      const amount = ethers.formatEther(args.amount);

      // Find market by contract address
      const market = await prisma.market.findFirst({
        where: { contractAddress: marketId },
        include: { outcomes: true }
      });

      if (!market) {
        logger.warn(`Market not found for prediction: ${marketId}`);
        return;
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: userAddress }
      });

      if (!user) {
        user = await prisma.user.create({
          data: { walletAddress: userAddress }
        });
      }

      // Get the outcome
      const outcome = market.outcomes[outcomeIndex];
      if (!outcome) {
        logger.warn(`Invalid outcome index: ${outcomeIndex}`);
        return;
      }

      // Get transaction hash
      const txHash = event.transactionHash;

      // Create prediction
      const prediction = await prisma.prediction.create({
        data: {
          userId: user.id,
          marketId: market.id,
          outcomeId: outcome.id,
          amount: parseFloat(amount),
          odds: outcome.probability,
          potential: parseFloat(amount) / outcome.probability,
          txHash,
          status: 'ACTIVE'
        }
      });

      // Update market totals
      await prisma.$transaction([
        prisma.market.update({
          where: { id: market.id },
          data: {
            totalStaked: { increment: parseFloat(amount) },
            totalVolume: { increment: parseFloat(amount) }
          }
        }),
        prisma.outcome.update({
          where: { id: outcome.id },
          data: {
            totalStaked: { increment: parseFloat(amount) }
          }
        })
      ]);

      logger.info(`Prediction saved: ${prediction.id}`);
    } catch (error) {
      logger.error('Error processing PredictionPlaced event:', error);
    }
  }

  /**
   * Process MarketResolved event and update database
   */
  private async processMarketResolvedEvent(event: any) {
    try {
      const args = event.args;
      if (!args) return;

      const marketId = args.marketId.toString();
      const winningOutcome = Number(args.winningOutcome);
      const resolutionTime = new Date(Number(args.resolutionTime) * 1000);

      // Find market
      const market = await prisma.market.findFirst({
        where: { contractAddress: marketId },
        include: { outcomes: true }
      });

      if (!market) {
        logger.warn(`Market not found for resolution: ${marketId}`);
        return;
      }

      const outcome = market.outcomes[winningOutcome];
      if (!outcome) {
        logger.warn(`Invalid winning outcome: ${winningOutcome}`);
        return;
      }

      // Update market status
      await prisma.market.update({
        where: { id: market.id },
        data: {
          status: 'RESOLVED',
          outcome: outcome.name,
          resolutionDate: resolutionTime
        }
      });

      // Mark winning outcome
      await prisma.outcome.update({
        where: { id: outcome.id },
        data: { isWinning: true }
      });

      // Create resolution record
      await prisma.resolution.create({
        data: {
          marketId: market.id,
          resolvedBy: 'AI_ORACLE',
          outcome: outcome.name,
          confidence: 1.0,
          humanVerified: true,
          status: 'CONFIRMED'
        }
      });

      logger.info(`Market resolved: ${market.id} - Winner: ${outcome.name}`);
    } catch (error) {
      logger.error('Error processing MarketResolved event:', error);
    }
  }

  /**
   * Get block number by timestamp (approximate)
   */
  private async getBlockNumberByTimestamp(timestamp: Date): Promise<number> {
    try {
      const currentBlock = await this.provider.getBlock('latest');
      if (!currentBlock) return 0;

      const timestampSeconds = Math.floor(timestamp.getTime() / 1000);
      const currentTimestamp = currentBlock.timestamp;
      const timeDiff = currentTimestamp - timestampSeconds;
      
      // BSC has ~3 second block time
      const blockDiff = Math.floor(timeDiff / 3);
      
      return Math.max(0, currentBlock.number - blockDiff);
    } catch (error) {
      logger.error('Error getting block number by timestamp:', error);
      return 0;
    }
  }
}

// Export factory function instead of singleton to allow lazy initialization
let blockchainSyncServiceInstance: BlockchainSyncService | null = null;

export function getBlockchainSyncService(): BlockchainSyncService {
  if (!blockchainSyncServiceInstance) {
    blockchainSyncServiceInstance = new BlockchainSyncService();
  }
  return blockchainSyncServiceInstance;
}

