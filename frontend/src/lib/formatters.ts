import type { MarketCategory, MarketStatus, PredictionOutcome, DisputeStatus, ProposalStatus, StakingPeriod, TransactionType } from './enums';
import { MarketCategory as MC, MarketStatus as MS, PredictionOutcome as PO, DisputeStatus as DS, ProposalStatus as PS, StakingPeriod as SP, TransactionType as TT } from './enums';

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatTimeRemaining = (endDate: Date): string => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m`;
};

export const formatCategoryLabel = (category: MarketCategory): string => {
  const labels: Record<MarketCategory, string> = {
    [MC.CRYPTO]: 'Crypto',
    [MC.SPORTS]: 'Sports',
    [MC.POLITICS]: 'Politics',
    [MC.AI_TRENDS]: 'AI Trends',
    [MC.ENTERTAINMENT]: 'Entertainment',
    [MC.FINANCE]: 'Finance',
    [MC.TECHNOLOGY]: 'Technology',
    [MC.WEATHER]: 'Weather',
    [MC.OTHER]: 'Other'
  };
  return labels[category];
};

export const formatMarketStatus = (status: MarketStatus): string => {
  const labels: Record<MarketStatus, string> = {
    [MS.ACTIVE]: 'Active',
    [MS.PENDING]: 'Pending',
    [MS.RESOLVED]: 'Resolved',
    [MS.DISPUTED]: 'Disputed',
    [MS.CANCELLED]: 'Cancelled'
  };
  return labels[status];
};

export const formatPredictionOutcome = (outcome: PredictionOutcome): string => {
  const labels: Record<PredictionOutcome, string> = {
    [PO.YES]: 'Yes',
    [PO.NO]: 'No',
    [PO.PENDING]: 'Pending'
  };
  return labels[outcome];
};

export const formatDisputeStatus = (status: DisputeStatus): string => {
  const labels: Record<DisputeStatus, string> = {
    [DS.OPEN]: 'Open',
    [DS.VOTING]: 'Voting',
    [DS.RESOLVED]: 'Resolved',
    [DS.REJECTED]: 'Rejected'
  };
  return labels[status];
};

export const formatProposalStatus = (status: ProposalStatus): string => {
  const labels: Record<ProposalStatus, string> = {
    [PS.DRAFT]: 'Draft',
    [PS.ACTIVE]: 'Active',
    [PS.PASSED]: 'Passed',
    [PS.REJECTED]: 'Rejected',
    [PS.EXECUTED]: 'Executed'
  };
  return labels[status];
};

export const formatStakingPeriod = (period: StakingPeriod): string => {
  const labels: Record<StakingPeriod, string> = {
    [SP.FLEXIBLE]: 'Flexible',
    [SP.THIRTY_DAYS]: '30 Days',
    [SP.NINETY_DAYS]: '90 Days',
    [SP.ONE_YEAR]: '1 Year'
  };
  return labels[period];
};

export const formatTransactionType = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    [TT.STAKE]: 'Stake',
    [TT.UNSTAKE]: 'Unstake',
    [TT.REWARD]: 'Reward',
    [TT.PREDICTION]: 'Prediction',
    [TT.DISPUTE]: 'Dispute'
  };
  return labels[type];
};

export const formatAddress = (address: string): string => {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};