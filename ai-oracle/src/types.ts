/**
 * Type definitions for TruthMesh AI Oracle System
 */

export interface Market {
  id: string;
  question: string;
  description?: string;
  category: string;
  outcomes: string[];
  deadline: Date;
  createdAt: Date;
  creator: string;
  totalStake: number;
  status: MarketStatus;
  metadata?: Record<string, any>;
}

export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  PENDING_RESOLUTION = 'PENDING_RESOLUTION',
  RESOLVED = 'RESOLVED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export interface OracleResult {
  marketId: string;
  outcome: string;
  confidence: number;
  evidence: string[];
  agentResponses: AgentResponse[];
  timestamp: Date;
  disputeWindow: number;
  resolved: boolean;
  transactionHash?: string;
  error?: string;
  disputeResolved?: boolean;
}

export interface AgentResponse {
  agentId: string;
  agentType: AgentType;
  outcome: string;
  confidence: number;
  reasoning: string[];
  dataUsed: DataPoint[];
  timestamp: Date;
  processingTime: number;
}

export enum AgentType {
  DATA_FETCHER = 'DATA_FETCHER',
  VALIDATOR = 'VALIDATOR',
  ARBITER = 'ARBITER',
  CONFIDENCE_SCORER = 'CONFIDENCE_SCORER'
}

export interface DataPoint {
  source: string;
  value: any;
  timestamp: Date;
  reliability: number;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ConsensusResult {
  outcome: string;
  confidence: number;
  evidence: string[];
  agentVotes: AgentVote[];
  consensusMethod: string;
  timestamp: Date;
}

export interface AgentVote {
  agentId: string;
  outcome: string;
  weight: number;
  confidence: number;
}

export interface OracleConfig {
  minConsensusThreshold: number;
  maxResolutionTime: number;
  disputeWindow: number;
  agentTimeout: number;
  maxRetries: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  url: string;
  apiKey?: string;
  reliability: number;
  isHealthy: boolean;
  lastCheck: Date;
  rateLimitRemaining?: number;
}

export enum DataSourceType {
  FINANCIAL_API = 'FINANCIAL_API',
  NEWS_API = 'NEWS_API',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  WEATHER_API = 'WEATHER_API',
  SPORTS_API = 'SPORTS_API',
  GOVERNMENT_API = 'GOVERNMENT_API',
  WEB_SCRAPING = 'WEB_SCRAPING'
}

export interface BlockchainConfig {
  providerUrl: string;
  chainId: number;
  contractAddress: string;
  privateKey: string;
  gasLimit: number;
  gasPrice?: string;
}

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  isActive: boolean;
  lastActivity: Date;
  successRate: number;
  averageProcessingTime: number;
}

export interface SystemStatus {
  initialized: boolean;
  activeResolutions: number;
  blockchain: BlockchainStatus;
  agents: Record<string, AgentStatus>;
  consensusEngine: ConsensusEngineStatus;
  uptime: number;
  timestamp: Date;
}

export interface BlockchainStatus {
  connected: boolean;
  networkName: string;
  latestBlock: number;
  gasPrice: string;
  balance: string;
}

export interface AgentStatus {
  active: boolean;
  healthy: boolean;
  lastActivity: Date;
  tasksCompleted: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface ConsensusEngineStatus {
  active: boolean;
  consensusMethod: string;
  averageConsensusTime: number;
  totalConsensusReached: number;
}

export interface DisputeResolution {
  outcome: string;
  confidence: number;
  evidence: string[];
  reasoning: string;
  timestamp: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }>;
  version: string;
  uptime: number;
}