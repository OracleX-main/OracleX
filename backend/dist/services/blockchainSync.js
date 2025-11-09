"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainSyncService = void 0;
exports.getBlockchainSyncService = getBlockchainSyncService;
const client_1 = require("@prisma/client");
const ethers_1 = require("ethers");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class BlockchainSyncService {
    constructor() {
        this.isRunning = false;
        const rpcUrls = [
            process.env.BSC_RPC_URL,
            'https://bsc-testnet-rpc.publicnode.com',
            'https://bsc-testnet.drpc.org',
            'https://endpoints.omniatech.io/v1/bsc/testnet/public',
            'https://data-seed-prebsc-2-s1.binance.org:8545'
        ].filter(Boolean);
        const rpcUrl = rpcUrls[0] || 'https://bsc-testnet-rpc.publicnode.com';
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl, undefined, {
            staticNetwork: ethers_1.ethers.Network.from({
                name: 'bsc-testnet',
                chainId: 97
            })
        });
        logger_1.logger.info(`Using RPC endpoint: ${rpcUrl}`);
        const marketFactoryAddress = process.env.MARKET_FACTORY_ADDRESS;
        if (!marketFactoryAddress) {
            logger_1.logger.warn('⚠️ MARKET_FACTORY_ADDRESS not set - blockchain sync will be disabled');
            logger_1.logger.info('💡 Set MARKET_FACTORY_ADDRESS in environment to enable blockchain sync');
            throw new Error('MARKET_FACTORY_ADDRESS not configured');
        }
        const abi = [
            'event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 endTime, string category, uint8 oracleType)',
            'event PredictionPlaced(uint256 indexed marketId, address indexed user, uint8 outcome, uint256 amount)',
            'event MarketResolved(uint256 indexed marketId, uint8 winningOutcome, uint256 resolutionTime)',
            'function getMarket(uint256 marketId) view returns (string question, uint256 endTime, bool resolved, uint8 outcome, uint256 totalStaked, address creator, string category)'
        ];
        this.marketFactoryContract = new ethers_1.ethers.Contract(marketFactoryAddress, abi, this.provider);
    }
    async start() {
        if (this.isRunning) {
            logger_1.logger.warn('Blockchain sync service is already running');
            return;
        }
        try {
            logger_1.logger.info('Starting blockchain sync service...');
            try {
                const network = await this.provider.getNetwork();
                logger_1.logger.info(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
            }
            catch (networkError) {
                logger_1.logger.error('Failed to connect to blockchain network:', networkError);
                logger_1.logger.warn('⚠️ Blockchain sync service disabled due to network error');
                logger_1.logger.info('💡 Backend will continue running without blockchain sync');
                return;
            }
            this.isRunning = true;
            const enableHistoricalSync = process.env.ENABLE_HISTORICAL_SYNC === 'true';
            if (enableHistoricalSync) {
                await this.syncHistoricalData();
            }
            else {
                logger_1.logger.info('Historical sync disabled. Only listening for new events.');
                logger_1.logger.info('Set ENABLE_HISTORICAL_SYNC=true in .env to enable historical sync.');
            }
            this.listenToEvents();
        }
        catch (error) {
            logger_1.logger.error('Error starting blockchain sync service:', error);
            logger_1.logger.warn('⚠️ Backend will continue running without blockchain sync');
            this.isRunning = false;
        }
    }
    stop() {
        this.isRunning = false;
        this.marketFactoryContract.removeAllListeners();
        logger_1.logger.info('Blockchain sync service stopped');
    }
    async syncHistoricalData() {
        try {
            logger_1.logger.info('Syncing historical blockchain data...');
            const latestMarket = await prisma.market.findFirst({
                where: { contractAddress: { not: null } },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            });
            const currentBlock = await this.provider.getBlockNumber();
            let fromBlock;
            if (latestMarket) {
                fromBlock = await this.getBlockNumberByTimestamp(latestMarket.createdAt);
            }
            else {
                const deploymentBlock = parseInt(process.env.DEPLOYMENT_BLOCK || '0');
                const recentBlocks = 10000;
                fromBlock = Math.max(deploymentBlock, currentBlock - recentBlocks);
            }
            logger_1.logger.info(`Syncing from block ${fromBlock} to ${currentBlock}`);
            const CHUNK_SIZE = 2000;
            const totalBlocks = currentBlock - fromBlock;
            if (totalBlocks > CHUNK_SIZE) {
                logger_1.logger.info(`Large block range detected. Syncing in chunks of ${CHUNK_SIZE} blocks...`);
            }
            let allEvents = [];
            for (let start = fromBlock; start <= currentBlock; start += CHUNK_SIZE) {
                const end = Math.min(start + CHUNK_SIZE - 1, currentBlock);
                try {
                    const filter = this.marketFactoryContract.filters.MarketCreated();
                    const events = await this.marketFactoryContract.queryFilter(filter, start, end);
                    allEvents = allEvents.concat(events);
                    if (totalBlocks > CHUNK_SIZE) {
                        logger_1.logger.info(`Synced blocks ${start} to ${end} - Found ${events.length} events`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (chunkError) {
                    logger_1.logger.warn(`Failed to sync blocks ${start} to ${end}:`, chunkError);
                }
            }
            logger_1.logger.info(`Found ${allEvents.length} MarketCreated events total`);
            for (const event of allEvents) {
                await this.processMarketCreatedEvent(event);
            }
            logger_1.logger.info('Historical data sync completed');
        }
        catch (error) {
            logger_1.logger.error('Error syncing historical data:', error);
        }
    }
    listenToEvents() {
        logger_1.logger.info('Listening for blockchain events...');
        const errorHandler = (error) => {
            if (error?.message?.includes('filter not found')) {
                return;
            }
            logger_1.logger.error('Event listener error:', error);
        };
        this.marketFactoryContract.on('MarketCreated', async (marketId, creator, question, endTime, category, oracleType, event) => {
            try {
                logger_1.logger.info(`New MarketCreated event: Market ID ${marketId}`);
                await this.processMarketCreatedEvent(event);
            }
            catch (error) {
                logger_1.logger.error('Error processing MarketCreated event:', error);
            }
        });
        this.marketFactoryContract.on('PredictionPlaced', async (marketId, user, outcome, amount, event) => {
            try {
                logger_1.logger.info(`New PredictionPlaced event: Market ${marketId}, User ${user}`);
                await this.processPredictionPlacedEvent(event);
            }
            catch (error) {
                logger_1.logger.error('Error processing PredictionPlaced event:', error);
            }
        });
        this.marketFactoryContract.on('MarketResolved', async (marketId, winningOutcome, resolutionTime, event) => {
            try {
                logger_1.logger.info(`New MarketResolved event: Market ${marketId}`);
                await this.processMarketResolvedEvent(event);
            }
            catch (error) {
                logger_1.logger.error('Error processing MarketResolved event:', error);
            }
        });
        this.provider.on('error', errorHandler);
    }
    async processMarketCreatedEvent(event) {
        try {
            const args = event.args;
            if (!args)
                return;
            const marketId = args.marketId.toString();
            const creator = args.creator.toLowerCase();
            const question = args.question;
            const endTime = new Date(Number(args.endTime) * 1000);
            const category = args.category || 'Uncategorized';
            const existingMarket = await prisma.market.findFirst({
                where: { contractAddress: marketId }
            });
            if (existingMarket) {
                logger_1.logger.info(`Market ${marketId} already exists in database`);
                return;
            }
            let user = await prisma.user.findUnique({
                where: { walletAddress: creator }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        walletAddress: creator
                    }
                });
                logger_1.logger.info(`Created new user: ${creator}`);
            }
            const marketData = await this.marketFactoryContract.getMarket(marketId);
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
            logger_1.logger.info(`Market created in database: ${market.id} (Blockchain ID: ${marketId})`);
        }
        catch (error) {
            logger_1.logger.error('Error processing MarketCreated event:', error);
        }
    }
    async processPredictionPlacedEvent(event) {
        try {
            const args = event.args;
            if (!args)
                return;
            const marketId = args.marketId.toString();
            const userAddress = args.user.toLowerCase();
            const outcomeIndex = Number(args.outcome);
            const amount = ethers_1.ethers.formatEther(args.amount);
            const market = await prisma.market.findFirst({
                where: { contractAddress: marketId },
                include: { outcomes: true }
            });
            if (!market) {
                logger_1.logger.warn(`Market not found for prediction: ${marketId}`);
                return;
            }
            let user = await prisma.user.findUnique({
                where: { walletAddress: userAddress }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: { walletAddress: userAddress }
                });
            }
            const outcome = market.outcomes[outcomeIndex];
            if (!outcome) {
                logger_1.logger.warn(`Invalid outcome index: ${outcomeIndex}`);
                return;
            }
            const txHash = event.transactionHash;
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
            logger_1.logger.info(`Prediction saved: ${prediction.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error processing PredictionPlaced event:', error);
        }
    }
    async processMarketResolvedEvent(event) {
        try {
            const args = event.args;
            if (!args)
                return;
            const marketId = args.marketId.toString();
            const winningOutcome = Number(args.winningOutcome);
            const resolutionTime = new Date(Number(args.resolutionTime) * 1000);
            const market = await prisma.market.findFirst({
                where: { contractAddress: marketId },
                include: { outcomes: true }
            });
            if (!market) {
                logger_1.logger.warn(`Market not found for resolution: ${marketId}`);
                return;
            }
            const outcome = market.outcomes[winningOutcome];
            if (!outcome) {
                logger_1.logger.warn(`Invalid winning outcome: ${winningOutcome}`);
                return;
            }
            await prisma.market.update({
                where: { id: market.id },
                data: {
                    status: 'RESOLVED',
                    outcome: outcome.name,
                    resolutionDate: resolutionTime
                }
            });
            await prisma.outcome.update({
                where: { id: outcome.id },
                data: { isWinning: true }
            });
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
            logger_1.logger.info(`Market resolved: ${market.id} - Winner: ${outcome.name}`);
        }
        catch (error) {
            logger_1.logger.error('Error processing MarketResolved event:', error);
        }
    }
    async getBlockNumberByTimestamp(timestamp) {
        try {
            const currentBlock = await this.provider.getBlock('latest');
            if (!currentBlock)
                return 0;
            const timestampSeconds = Math.floor(timestamp.getTime() / 1000);
            const currentTimestamp = currentBlock.timestamp;
            const timeDiff = currentTimestamp - timestampSeconds;
            const blockDiff = Math.floor(timeDiff / 3);
            return Math.max(0, currentBlock.number - blockDiff);
        }
        catch (error) {
            logger_1.logger.error('Error getting block number by timestamp:', error);
            return 0;
        }
    }
}
exports.BlockchainSyncService = BlockchainSyncService;
let blockchainSyncServiceInstance = null;
function getBlockchainSyncService() {
    if (!blockchainSyncServiceInstance) {
        blockchainSyncServiceInstance = new BlockchainSyncService();
    }
    return blockchainSyncServiceInstance;
}
//# sourceMappingURL=blockchainSync.js.map