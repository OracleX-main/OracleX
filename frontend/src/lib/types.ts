// Type definitions for OracleX platform data structures

import type { MarketCategory, MarketStatus, PredictionOutcome, DisputeStatus, ProposalStatus, StakingPeriod, TransactionType } from './enums';

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  status: MarketStatus;
  poolSize: number;
  participants: number;
  endDate: Date;
  yesOdds: number;
  noOdds: number;
  confidenceScore: number;
  volume24h: number;
  createdAt: Date;
  creatorAddress: string;
}

export interface UserPrediction {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: PredictionOutcome;
  amount: number;
  odds: number;
  potentialReturn: number;
  status: MarketStatus;
  placedAt: Date;
}

export interface UserPortfolio {
  activePredictions: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  totalEarned: number;
  totalStaked: number;
  accuracyScore: number;
  currentStreak: number;
  rank: number;
  reputationScore: number;
}

export interface Dispute {
  id: string;
  marketId: string;
  marketTitle: string;
  status: DisputeStatus;
  challenger: string;
  stakeAmount: number;
  votesFor: number;
  votesAgainst: number;
  evidence: string;
  createdAt: Date;
  votingEndsAt: Date;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  createdAt: Date;
  votingEndsAt: Date;
}

export interface StakingData {
  totalStaked: number;
  availableBalance: number;
  pendingRewards: number;
  apy: number;
  stakingPeriod: StakingPeriod;
  unlockDate: Date;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  username: string;
  totalEarned: number;
  winRate: number;
  accuracyScore: number;
  totalPredictions: number;
  badges: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  marketTitle: string;
  timestamp: Date;
  txHash: string;
}

export interface AIAnalysis {
  confidenceScore: number;
  sentiment: string;
  dataSources: number;
  lastUpdated: Date;
  keyFactors: string[];
  riskFactors: string[];
}

export interface Analytics {
  totalMarkets: number;
  activeUsers: number;
  totalVolume: number;
  averageAccuracy: number;
  disputeRate: number;
  marketsResolved: number;
  tokenCirculation: number;
}