// Enums for OracleX platform

export enum MarketCategory {
  CRYPTO = "crypto",
  SPORTS = "sports",
  POLITICS = "politics",
  AI_TRENDS = "ai_trends",
  ENTERTAINMENT = "entertainment",
  FINANCE = "finance",
  TECHNOLOGY = "technology",
  WEATHER = "weather",
  OTHER = "other"
}

export enum MarketStatus {
  ACTIVE = "active",
  PENDING = "pending",
  RESOLVED = "resolved",
  DISPUTED = "disputed",
  CANCELLED = "cancelled"
}

export enum PredictionOutcome {
  YES = "yes",
  NO = "no",
  PENDING = "pending"
}

export enum DisputeStatus {
  OPEN = "open",
  VOTING = "voting",
  RESOLVED = "resolved",
  REJECTED = "rejected"
}

export enum TimeFilter {
  ALL_TIME = "all_time",
  THIS_WEEK = "this_week",
  THIS_MONTH = "this_month",
  TODAY = "today"
}

export enum UserRole {
  USER = "user",
  VALIDATOR = "validator",
  ADMIN = "admin",
  DEVELOPER = "developer"
}

export enum ProposalStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PASSED = "passed",
  REJECTED = "rejected",
  EXECUTED = "executed"
}

export enum StakingPeriod {
  FLEXIBLE = "flexible",
  THIRTY_DAYS = "30_days",
  NINETY_DAYS = "90_days",
  ONE_YEAR = "1_year"
}

export enum TransactionType {
  STAKE = "stake",
  UNSTAKE = "unstake",
  REWARD = "reward",
  PREDICTION = "prediction",
  DISPUTE = "dispute"
}

export enum SortOrder {
  NEWEST = "newest",
  OLDEST = "oldest",
  MOST_POPULAR = "most_popular",
  HIGHEST_VOLUME = "highest_volume",
  ENDING_SOON = "ending_soon"
}