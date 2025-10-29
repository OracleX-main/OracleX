/**
 * TruthMesh Oracle - Main Oracle System
 * Coordinates all AI agents, consensus mechanisms, and blockchain interactions
 */

import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';
import { config } from '../config';
import { BlockchainClient } from '../blockchain/client';
import { DataFetcher } from '../agents/DataFetcher';
import { ValidatorAgent } from '../agents/ValidatorAgent';
import { ArbiterAgent } from '../agents/ArbiterAgent';
import { ConfidenceScorerAgent } from '../agents/ConfidenceScorerAgent';
import { ConsensusEngine } from '../consensus/ConsensusEngine';
import { 
  Market, 
  OracleResult, 
  AgentResponse, 
  ConsensusResult,
  OracleConfig 
} from '../types';

export class TruthMeshOracle extends EventEmitter {
  private io: SocketIOServer;
  private blockchain: BlockchainClient;
  private dataFetcher: DataFetcher;
  private validator: ValidatorAgent;
  private arbiter: ArbiterAgent;
  private confidenceScorer: ConfidenceScorerAgent;
  private consensusEngine: ConsensusEngine;
  private isInitialized: boolean = false;
  private activeResolutions: Map<string, Promise<OracleResult>> = new Map();

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    
    // Create blockchain config with defaults
    const blockchainConfig = {
      chainId: 56, // BNB Smart Chain
      providerUrl: config.WEB3_PROVIDER_URL || 'https://bsc-dataseed1.binance.org',
      contractAddress: '0x0000000000000000000000000000000000000000',
      privateKey: '',
      gasLimit: 500000,
      gasPrice: '5000000000' // 5 gwei
    };
    
    // Create oracle config with defaults
    const oracleConfig = {
      minConsensusThreshold: 0.7,
      maxResolutionTime: 300000, // 5 minutes
      disputeWindow: 3600000, // 1 hour
      agentTimeout: 30000, // 30 seconds
      maxRetries: 3
    };
    
    this.blockchain = new BlockchainClient(blockchainConfig);
    this.dataFetcher = new DataFetcher();
    this.validator = new ValidatorAgent();
    this.arbiter = new ArbiterAgent();
    this.confidenceScorer = new ConfidenceScorerAgent();
    this.consensusEngine = new ConsensusEngine(oracleConfig);
  }

  /**
   * Initialize the Oracle system
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🔮 Initializing TruthMesh Oracle System...');

      // Initialize blockchain connection
      await this.blockchain.connect();
      logger.info('✅ Blockchain connection established');

      // Initialize AI agents
      await Promise.all([
        this.dataFetcher.initialize(),
        this.validator.initialize(),
        this.arbiter.initialize(),
        this.confidenceScorer.initialize(),
      ]);
      logger.info('✅ AI agents initialized');

      // Initialize consensus engine
      await this.consensusEngine.initialize();
      logger.info('✅ Consensus engine ready');

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      logger.info('🚀 TruthMesh Oracle System fully initialized');

      // Emit initialization complete
      this.emit('initialized');

    } catch (error) {
      logger.error('❌ Failed to initialize Oracle system:', error);
      throw error;
    }
  }

  /**
   * Resolve a prediction market
   */
  public async resolveMarket(marketId: string): Promise<OracleResult> {
    if (!this.isInitialized) {
      throw new Error('Oracle system not initialized');
    }

    // Check if resolution is already in progress
    if (this.activeResolutions.has(marketId)) {
      logger.info(`⏳ Market ${marketId} resolution already in progress`);
      return this.activeResolutions.get(marketId)!;
    }

    // Start resolution process
    const resolutionPromise = this.performResolution(marketId);
    this.activeResolutions.set(marketId, resolutionPromise);

    try {
      const result = await resolutionPromise;
      this.activeResolutions.delete(marketId);
      return result;
    } catch (error) {
      this.activeResolutions.delete(marketId);
      throw error;
    }
  }

  /**
   * Perform the actual market resolution
   */
  private async performResolution(marketId: string): Promise<OracleResult> {
    logger.info(`🎯 Starting resolution for market ${marketId}`);

    try {
      // Get market details from blockchain
      const market = await this.blockchain.getMarket(marketId);
      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }

      // Emit resolution started
      this.emit('resolutionStarted', { marketId, market });
      this.io.to(`market:${marketId}`).emit('resolutionStarted', { marketId });

      // Step 1: Data Collection
      logger.info(`📊 Collecting data for market ${marketId}`);
      const rawData = await this.dataFetcher.fetchData(market);
      
      this.emit('dataCollected', { marketId, dataPoints: rawData.length });
      this.io.to(`market:${marketId}`).emit('dataCollected', { 
        marketId, 
        dataPoints: rawData.length 
      });

      // Step 2: Generate Agent Responses using BaseAgent interface
      logger.info(`🤖 Generating agent responses for market ${marketId}`);
      const agentResponses: AgentResponse[] = [];

      // Get responses from all agents using their generateResponse method
      const [
        fetcherResponse,
        validatorResponse,
        arbiterResponse,
        confidenceResponse
      ] = await Promise.allSettled([
        this.dataFetcher.generateResponse(rawData, market),
        this.validator.generateResponse(rawData, market),
        this.arbiter.generateResponse(rawData, market),
        this.confidenceScorer.generateResponse(rawData, market),
      ]);

      // Process successful responses
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

      // Step 4: Consensus Formation
      logger.info(`🤝 Forming consensus for market ${marketId}`);
      const consensus = await this.consensusEngine.formConsensus(agentResponses, market);
      
      this.emit('consensusFormed', { marketId, consensus });

      // Step 5: Final Resolution
      const oracleResult: OracleResult = {
        marketId,
        outcome: consensus.outcome,
        confidence: consensus.confidence,
        evidence: consensus.evidence,
        agentResponses,
        timestamp: new Date(),
        disputeWindow: config.DISPUTE_WINDOW,
        resolved: true
      };

      // Step 6: Submit to Blockchain
      logger.info(`⛓️ Submitting resolution to blockchain for market ${marketId}`);
      const txHash = await this.blockchain.submitResolution(oracleResult);
      oracleResult.transactionHash = txHash;

      // Emit final result
      this.emit('resolutionCompleted', oracleResult);
      this.io.to(`market:${marketId}`).emit('resolutionCompleted', oracleResult);

      logger.info(`✅ Market ${marketId} resolved successfully`);
      return oracleResult;

    } catch (error) {
      logger.error(`❌ Failed to resolve market ${marketId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const errorResult: OracleResult = {
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

  /**
   * Handle dispute for a market resolution
   */
  public async handleDispute(marketId: string, evidence: string[]): Promise<OracleResult> {
    logger.info(`⚖️ Handling dispute for market ${marketId}`);

    try {
      const market = await this.blockchain.getMarket(marketId);
      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }

      // Use arbiter to resolve dispute
      const disputeResolution = await this.arbiter.resolveDispute(evidence, market);
      
      // Update blockchain with dispute resolution
      const txHash = await this.blockchain.submitDisputeResolution(marketId, disputeResolution);

      const result: OracleResult = {
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

    } catch (error) {
      logger.error(`❌ Failed to resolve dispute for market ${marketId}:`, error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  public async getSystemStatus() {
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

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.blockchain.on('marketCreated', (market: Market) => {
      logger.info(`📈 New market created: ${market.id}`);
      this.emit('marketCreated', market);
      this.io.emit('marketCreated', market);
    });

    this.blockchain.on('resolutionRequested', (marketId: string) => {
      logger.info(`🔔 Resolution requested for market: ${marketId}`);
      this.resolveMarket(marketId).catch(error => {
        logger.error(`Failed to auto-resolve market ${marketId}:`, error);
      });
    });

    this.blockchain.on('disputeRaised', (marketId: string, evidence: string[]) => {
      logger.info(`⚠️ Dispute raised for market: ${marketId}`);
      this.handleDispute(marketId, evidence).catch(error => {
        logger.error(`Failed to handle dispute for market ${marketId}:`, error);
      });
    });
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up Oracle system...');

    try {
      // Wait for active resolutions to complete (with timeout)
      const activePromises = Array.from(this.activeResolutions.values());
      if (activePromises.length > 0) {
        logger.info(`⏳ Waiting for ${activePromises.length} active resolutions...`);
        await Promise.allSettled(activePromises);
      }

      // Cleanup agents
      await Promise.all([
        this.dataFetcher.cleanup(),
        this.validator.cleanup(),
        this.arbiter.cleanup(),
        this.confidenceScorer.cleanup(),
      ]);

      // Cleanup consensus engine
      await this.consensusEngine.cleanup();

      // Disconnect blockchain
      await this.blockchain.disconnect();

      this.isInitialized = false;
      logger.info('✅ Oracle system cleanup completed');

    } catch (error) {
      logger.error('❌ Error during cleanup:', error);
    }
  }
}