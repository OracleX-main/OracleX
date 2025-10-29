import { MarketCategory, MarketStatus, PredictionOutcome, DisputeStatus, ProposalStatus, StakingPeriod, TransactionType } from './enums';

// ... existing code ...

export const mockMarkets = [
  {
    id: "market-1" as const,
    title: "Will Bitcoin reach $100,000 by end of 2025?" as const,
    description: "Prediction market for Bitcoin price reaching $100,000 USD by December 31, 2025" as const,
    category: MarketCategory.CRYPTO,
    status: MarketStatus.ACTIVE,
    poolSize: 245000,
    participants: 1247,
    endDate: new Date('2025-12-31'),
    yesOdds: 67.5,
    noOdds: 32.5,
    confidenceScore: 89,
    volume24h: 12500,
    createdAt: new Date('2025-01-15'),
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678" as const
  },
  {
    id: "market-2" as const,
    title: "Will AI surpass human performance in coding by 2026?" as const,
    description: "Market predicting if AI will achieve better than human-level performance in software development tasks" as const,
    category: MarketCategory.AI_TRENDS,
    status: MarketStatus.ACTIVE,
    poolSize: 180000,
    participants: 892,
    endDate: new Date('2026-12-31'),
    yesOdds: 54.2,
    noOdds: 45.8,
    confidenceScore: 76,
    volume24h: 8900,
    createdAt: new Date('2025-02-01'),
    creatorAddress: "0xabcdef1234567890abcdef1234567890abcdef12" as const
  },
  {
    id: "market-3" as const,
    title: "Will Real Madrid win Champions League 2025?" as const,
    description: "Prediction for Real Madrid winning the UEFA Champions League in 2025 season" as const,
    category: MarketCategory.SPORTS,
    status: MarketStatus.ACTIVE,
    poolSize: 320000,
    participants: 2156,
    endDate: new Date('2025-06-15'),
    yesOdds: 41.8,
    noOdds: 58.2,
    confidenceScore: 82,
    volume24h: 15600,
    createdAt: new Date('2025-01-20'),
    creatorAddress: "0x9876543210fedcba9876543210fedcba98765432" as const
  }
];

export const mockUserPortfolio = {
  activePredictions: 12,
  totalWon: 45,
  totalLost: 18,
  winRate: 71.4,
  totalEarned: 8750.50,
  totalStaked: 5200,
  accuracyScore: 84.5,
  currentStreak: 7,
  rank: 142,
  reputationScore: 892
};

export const mockUserPredictions = [
  {
    id: "pred-1" as const,
    marketId: "market-1" as const,
    marketTitle: "Will Bitcoin reach $100,000 by end of 2025?" as const,
    outcome: PredictionOutcome.YES,
    amount: 500,
    odds: 67.5,
    potentialReturn: 740.74,
    status: MarketStatus.ACTIVE,
    placedAt: new Date('2025-01-20')
  },
  {
    id: "pred-2" as const,
    marketId: "market-2" as const,
    marketTitle: "Will AI surpass human performance in coding by 2026?" as const,
    outcome: PredictionOutcome.YES,
    amount: 300,
    odds: 54.2,
    potentialReturn: 553.51,
    status: MarketStatus.ACTIVE,
    placedAt: new Date('2025-02-05')
  }
];

export const mockDisputes = [
  {
    id: "dispute-1" as const,
    marketId: "market-1" as const,
    marketTitle: "Will Bitcoin reach $100,000 by end of 2025?" as const,
    status: DisputeStatus.VOTING,
    challenger: "0x1111111111111111111111111111111111111111" as const,
    stakeAmount: 1000,
    votesFor: 245,
    votesAgainst: 89,
    evidence: "Price data shows Bitcoin reached $100,050 on December 30, 2025" as const,
    createdAt: new Date('2025-01-02'),
    votingEndsAt: new Date('2025-01-09')
  }
];

export const mockProposals = [
  {
    id: "prop-1" as const,
    title: "Increase AI Oracle Accuracy Threshold" as const,
    description: "Proposal to increase minimum AI confidence score from 75% to 85% for automatic resolution" as const,
    status: ProposalStatus.ACTIVE,
    proposer: "0x2222222222222222222222222222222222222222" as const,
    votesFor: 12500000,
    votesAgainst: 3200000,
    quorum: 10000000,
    createdAt: new Date('2025-01-25'),
    votingEndsAt: new Date('2025-02-08')
  },
  {
    id: "prop-2" as const,
    title: "Add New Market Category: Climate" as const,
    description: "Proposal to add Climate and Environment as a new prediction market category" as const,
    status: ProposalStatus.PASSED,
    proposer: "0x3333333333333333333333333333333333333333" as const,
    votesFor: 18900000,
    votesAgainst: 1100000,
    quorum: 10000000,
    createdAt: new Date('2025-01-10'),
    votingEndsAt: new Date('2025-01-24')
  }
];

export const mockStakingData = {
  totalStaked: 5200,
  availableBalance: 2800,
  pendingRewards: 145.50,
  apy: 18.5,
  stakingPeriod: StakingPeriod.NINETY_DAYS,
  unlockDate: new Date('2025-04-15')
};

export const mockLeaderboard = [
  {
    rank: 1,
    address: "0x4444444444444444444444444444444444444444" as const,
    username: "CryptoProphet" as const,
    totalEarned: 45600,
    winRate: 89.2,
    accuracyScore: 94.5,
    totalPredictions: 234,
    badges: ["Top Predictor" as const, "Crypto Expert" as const]
  },
  {
    rank: 2,
    address: "0x5555555555555555555555555555555555555555" as const,
    username: "AIOracle" as const,
    totalEarned: 38900,
    winRate: 86.7,
    accuracyScore: 91.2,
    totalPredictions: 189,
    badges: ["AI Specialist" as const]
  },
  {
    rank: 3,
    address: "0x6666666666666666666666666666666666666666" as const,
    username: "MarketMaster" as const,
    totalEarned: 32400,
    winRate: 84.1,
    accuracyScore: 88.9,
    totalPredictions: 156,
    badges: ["Consistent Winner" as const]
  }
];

export const mockTransactions = [
  {
    id: "tx-1" as const,
    type: TransactionType.PREDICTION,
    amount: 500,
    marketTitle: "Will Bitcoin reach $100,000 by end of 2025?" as const,
    timestamp: new Date('2025-01-20'),
    txHash: "0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234" as const
  },
  {
    id: "tx-2" as const,
    type: TransactionType.REWARD,
    amount: 145.50,
    marketTitle: "Staking Rewards" as const,
    timestamp: new Date('2025-01-19'),
    txHash: "0x1234abcd567890ef1234abcd567890ef1234abcd567890ef1234abcd567890ef" as const
  }
];

export const mockAIAnalysis = {
  confidenceScore: 89,
  sentiment: "Bullish" as const,
  dataSources: 24,
  lastUpdated: new Date('2025-01-26T10:30:00'),
  keyFactors: [
    "Institutional adoption increasing" as const,
    "Regulatory clarity improving" as const,
    "Historical price patterns favorable" as const
  ],
  riskFactors: [
    "Market volatility remains high" as const,
    "Macroeconomic uncertainty" as const
  ]
};

export const mockAnalytics = {
  totalMarkets: 1247,
  activeUsers: 12450,
  totalVolume: 2400000,
  averageAccuracy: 89.2,
  disputeRate: 2.3,
  marketsResolved: 892,
  tokenCirculation: 45000000
};