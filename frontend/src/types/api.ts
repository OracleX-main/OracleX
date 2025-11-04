// User types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  reputation: number;
  totalStaked: string;
  totalWinnings: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Market types
export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  endDate: string;
  resolutionDate?: string;
  creatorId: string;
  totalStaked: string;
  totalVolume: string;
  status: MarketStatus;
  outcome?: string;
  confidence?: number;
  metadata?: string;
  contractAddress?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  creator: User;
  outcomes: Outcome[];
  predictions: Prediction[];
}

export interface Outcome {
  id: string;
  marketId: string;
  name: string;
  probability: number;
  totalStaked: string;
  isWinning?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prediction {
  id: string;
  userId: string;
  marketId: string;
  outcomeId: string;
  amount: string;
  odds: number;
  potential: string;
  status: PredictionStatus;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  market: Market;
  outcome: Outcome;
}

// Resolution types
export interface Resolution {
  id: string;
  marketId: string;
  resolvedBy: string;
  outcome: string;
  confidence: number;
  evidence?: string;
  aiConsensus?: string;
  humanVerified: boolean;
  challengePeriod?: string;
  status: ResolutionStatus;
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string;
  currency: string;
  txHash: string;
  blockNumber?: number;
  status: TransactionStatus;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface MarketAnalytics {
  id: string;
  marketId: string;
  date: string;
  totalVolume: string;
  totalStaked: string;
  uniqueUsers: number;
  avgPrediction?: number;
  volatility?: number;
  momentum?: number;
  sentiment?: number;
  metadata?: string;
}

// Oracle types
export interface OracleEvent {
  id: string;
  eventType: string;
  marketId?: string;
  data: string;
  confidence?: number;
  processed: boolean;
  createdAt: string;
}

// Enums
export enum MarketStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum PredictionStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum ResolutionStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISPUTED = 'DISPUTED',
  OVERTURNED = 'OVERTURNED',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  STAKE = 'STAKE',
  PAYOUT = 'PAYOUT',
  FEE = 'FEE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

// API Request/Response types
export interface CreateMarketRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  endDate: string;
  outcomes: string[];
  metadata?: any;
}

export interface CreatePredictionRequest {
  marketId: string;
  outcomeId: string;
  amount: string;
  odds?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}