"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruthMeshOracle = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
const client_1 = require("../blockchain/client");
const DataFetcher_1 = require("../agents/DataFetcher");
const ValidatorAgent_1 = require("../agents/ValidatorAgent");
const ArbiterAgent_1 = require("../agents/ArbiterAgent");
const ConfidenceScorerAgent_1 = require("../agents/ConfidenceScorerAgent");
const ConsensusEngine_1 = require("../consensus/ConsensusEngine");
class TruthMeshOracle extends events_1.EventEmitter {
    constructor(io) {
        super();
        this.isInitialized = false;
        this.activeResolutions = new Map();
        this.io = io;
        const blockchainConfig = {
            chainId: 56,
            providerUrl: config_1.config.WEB3_PROVIDER_URL || 'https://bsc-dataseed1.binance.org',
            contractAddress: '0x0000000000000000000000000000000000000000',
            privateKey: '',
            gasLimit: 500000,
            gasPrice: '5000000000'
        };
        const oracleConfig = {
            minConsensusThreshold: 0.7,
            maxResolutionTime: 300000,
            disputeWindow: 3600000,
            agentTimeout: 30000,
            maxRetries: 3
        };
        this.blockchain = new client_1.BlockchainClient(blockchainConfig);
        this.dataFetcher = new DataFetcher_1.DataFetcher();
        this.validator = new ValidatorAgent_1.ValidatorAgent();
        this.arbiter = new ArbiterAgent_1.ArbiterAgent();
        this.confidenceScorer = new ConfidenceScorerAgent_1.ConfidenceScorerAgent();
        this.consensusEngine = new ConsensusEngine_1.ConsensusEngine(oracleConfig);
    }
    async initialize() {
        try {
            logger_1.logger.info('🔮 Initializing TruthMesh Oracle System...');
            await this.blockchain.connect();
            logger_1.logger.info('✅ Blockchain connection established');
            await Promise.all([
                this.dataFetcher.initialize(),
                this.validator.initialize(),
                this.arbiter.initialize(),
                this.confidenceScorer.initialize(),
            ]);
            logger_1.logger.info('✅ AI agents initialized');
            await this.consensusEngine.initialize();
            logger_1.logger.info('✅ Consensus engine ready');
            this.setupEventListeners();
            this.isInitialized = true;
            logger_1.logger.info('🚀 TruthMesh Oracle System fully initialized');
            this.emit('initialized');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize Oracle system:', error);
            throw error;
        }
    }
    async resolveMarket(marketId) {
        if (!this.isInitialized) {
            throw new Error('Oracle system not initialized');
        }
        if (this.activeResolutions.has(marketId)) {
            logger_1.logger.info(`⏳ Market ${marketId} resolution already in progress`);
            return this.activeResolutions.get(marketId);
        }
        const resolutionPromise = this.performResolution(marketId);
        this.activeResolutions.set(marketId, resolutionPromise);
        try {
            const result = await resolutionPromise;
            this.activeResolutions.delete(marketId);
            return result;
        }
        catch (error) {
            this.activeResolutions.delete(marketId);
            throw error;
        }
    }
    async performResolution(marketId) {
        logger_1.logger.info(`🎯 Starting resolution for market ${marketId}`);
        try {
            const market = await this.blockchain.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }
            this.emit('resolutionStarted', { marketId, market });
            this.io.to(`market:${marketId}`).emit('resolutionStarted', { marketId });
            logger_1.logger.info(`📊 Collecting data for market ${marketId}`);
            const rawData = await this.dataFetcher.fetchData(market);
            this.emit('dataCollected', { marketId, dataPoints: rawData.length });
            this.io.to(`market:${marketId}`).emit('dataCollected', {
                marketId,
                dataPoints: rawData.length
            });
            logger_1.logger.info(`🤖 Generating agent responses for market ${marketId}`);
            const agentResponses = [];
            const [fetcherResponse, validatorResponse, arbiterResponse, confidenceResponse] = await Promise.allSettled([
                this.dataFetcher.generateResponse(rawData, market),
                this.validator.generateResponse(rawData, market),
                this.arbiter.generateResponse(rawData, market),
                this.confidenceScorer.generateResponse(rawData, market),
            ]);
            if (fetcherResponse.status === 'fulfilled') {
                agentResponses.push(fetcherResponse.value);
            }
            if (validatorResponse.status === 'fulfilled') {
                agentResponses.push(validatorResponse.value);
            }
            if (arbiterResponse.status === 'fulfilled') {
                agentResponses.push(arbiterResponse.value);
            }
            if (confidenceResponse.status === 'fulfilled') {
                agentResponses.push(confidenceResponse.value);
            }
            if (agentResponses.length === 0) {
                throw new Error('No agent responses received');
            }
            this.emit('agentResponsesGenerated', {
                marketId,
                responseCount: agentResponses.length
            });
            logger_1.logger.info(`🤝 Forming consensus for market ${marketId}`);
            const consensus = await this.consensusEngine.formConsensus(agentResponses, market);
            this.emit('consensusFormed', { marketId, consensus });
            const oracleResult = {
                marketId,
                outcome: consensus.outcome,
                confidence: consensus.confidence,
                evidence: consensus.evidence,
                agentResponses,
                timestamp: new Date(),
                disputeWindow: config_1.config.DISPUTE_WINDOW,
                resolved: true
            };
            logger_1.logger.info(`⛓️ Submitting resolution to blockchain for market ${marketId}`);
            const txHash = await this.blockchain.submitResolution(oracleResult);
            oracleResult.transactionHash = txHash;
            this.emit('resolutionCompleted', oracleResult);
            this.io.to(`market:${marketId}`).emit('resolutionCompleted', oracleResult);
            logger_1.logger.info(`✅ Market ${marketId} resolved successfully`);
            return oracleResult;
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to resolve market ${marketId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorResult = {
                marketId,
                outcome: 'ERROR',
                confidence: 0,
                evidence: [`Resolution failed: ${errorMessage}`],
                agentResponses: [],
                timestamp: new Date(),
                disputeWindow: 0,
                resolved: false,
                error: errorMessage
            };
            this.emit('resolutionFailed', { marketId, error: errorMessage });
            this.io.to(`market:${marketId}`).emit('resolutionFailed', {
                marketId,
                error: errorMessage
            });
            return errorResult;
        }
    }
    async handleDispute(marketId, evidence) {
        logger_1.logger.info(`⚖️ Handling dispute for market ${marketId}`);
        try {
            const market = await this.blockchain.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }
            const disputeResolution = await this.arbiter.resolveDispute(evidence, market);
            const txHash = await this.blockchain.submitDisputeResolution(marketId, disputeResolution);
            const result = {
                marketId,
                outcome: disputeResolution.outcome,
                confidence: disputeResolution.confidence,
                evidence: disputeResolution.evidence,
                agentResponses: [],
                timestamp: new Date(),
                disputeWindow: 0,
                resolved: true,
                transactionHash: txHash,
                disputeResolved: true
            };
            this.emit('disputeResolved', result);
            this.io.to(`market:${marketId}`).emit('disputeResolved', result);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to resolve dispute for market ${marketId}:`, error);
            throw error;
        }
    }
    async getSystemStatus() {
        return {
            initialized: this.isInitialized,
            activeResolutions: this.activeResolutions.size,
            blockchain: await this.blockchain.getStatus(),
            agents: {
                dataFetcher: this.dataFetcher.getStatus(),
                validator: this.validator.getStatus(),
                arbiter: this.arbiter.getStatus(),
                confidenceScorer: this.confidenceScorer.getStatus(),
            },
            consensusEngine: this.consensusEngine.getStatus(),
            uptime: process.uptime(),
            timestamp: new Date()
        };
    }
    setupEventListeners() {
        this.blockchain.on('marketCreated', (market) => {
            logger_1.logger.info(`📈 New market created: ${market.id}`);
            this.emit('marketCreated', market);
            this.io.emit('marketCreated', market);
        });
        this.blockchain.on('resolutionRequested', (marketId) => {
            logger_1.logger.info(`🔔 Resolution requested for market: ${marketId}`);
            this.resolveMarket(marketId).catch(error => {
                logger_1.logger.error(`Failed to auto-resolve market ${marketId}:`, error);
            });
        });
        this.blockchain.on('disputeRaised', (marketId, evidence) => {
            logger_1.logger.info(`⚠️ Dispute raised for market: ${marketId}`);
            this.handleDispute(marketId, evidence).catch(error => {
                logger_1.logger.error(`Failed to handle dispute for market ${marketId}:`, error);
            });
        });
    }
    async cleanup() {
        logger_1.logger.info('🧹 Cleaning up Oracle system...');
        try {
            const activePromises = Array.from(this.activeResolutions.values());
            if (activePromises.length > 0) {
                logger_1.logger.info(`⏳ Waiting for ${activePromises.length} active resolutions...`);
                await Promise.allSettled(activePromises);
            }
            await Promise.all([
                this.dataFetcher.cleanup(),
                this.validator.cleanup(),
                this.arbiter.cleanup(),
                this.confidenceScorer.cleanup(),
            ]);
            await this.consensusEngine.cleanup();
            await this.blockchain.disconnect();
            this.isInitialized = false;
            logger_1.logger.info('✅ Oracle system cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('❌ Error during cleanup:', error);
        }
    }
}
exports.TruthMeshOracle = TruthMeshOracle;
//# sourceMappingURL=TruthMeshOracle.js.map