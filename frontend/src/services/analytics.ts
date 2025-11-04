import { apiService } from './api';
import type {
  MarketAnalytics,
  ApiResponse,
} from '../types/api';

class AnalyticsService {
  /**
   * Get market analytics
   */
  async getMarketAnalytics(marketId: string, days = 30): Promise<ApiResponse<MarketAnalytics[]>> {
    return apiService.get(`/analytics/markets/${marketId}?days=${days}`);
  }

  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(days = 30): Promise<ApiResponse<{
    totalVolume: string;
    totalMarkets: number;
    totalUsers: number;
    totalPredictions: number;
    averageAccuracy: number;
    topCategories: { category: string; volume: string; count: number }[];
    volumeHistory: { date: string; volume: string }[];
    userGrowth: { date: string; users: number }[];
  }>> {
    return apiService.get(`/analytics/platform?days=${days}`);
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<ApiResponse<{
    totalPredictions: number;
    winRate: number;
    totalWinnings: string;
    avgStake: string;
    favoriteCategories: string[];
    predictionHistory: {
      date: string;
      predictions: number;
      winnings: string;
    }[];
    accuracyTrend: {
      date: string;
      accuracy: number;
    }[];
  }>> {
    return apiService.get(`/analytics/users/${userId}`);
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics(category: string, days = 30): Promise<ApiResponse<{
    totalVolume: string;
    totalMarkets: number;
    averageAccuracy: number;
    topPerformers: {
      userId: string;
      username: string;
      accuracy: number;
      winnings: string;
    }[];
    volumeTrend: {
      date: string;
      volume: string;
    }[];
  }>> {
    return apiService.get(`/analytics/categories/${category}?days=${days}`);
  }

  /**
   * Get oracle performance analytics
   */
  async getOracleAnalytics(): Promise<ApiResponse<{
    totalResolutions: number;
    accuracy: number;
    averageConfidence: number;
    resolutionTime: number;
    disputeRate: number;
    successRate: number;
    dataSourcesUsed: {
      source: string;
      usage: number;
      reliability: number;
    }[];
    performanceHistory: {
      date: string;
      accuracy: number;
      resolutions: number;
    }[];
  }>> {
    return apiService.get('/analytics/oracle');
  }

  /**
   * Get real-time platform metrics
   */
  async getRealTimeMetrics(): Promise<ApiResponse<{
    activeUsers: number;
    liveMarkets: number;
    totalVolumeToday: string;
    predictionsMadeToday: number;
    averageMarketLiquidity: string;
    networkHealth: 'healthy' | 'degraded' | 'offline';
  }>> {
    return apiService.get('/analytics/realtime');
  }

  /**
   * Get leaderboard analytics
   */
  async getLeaderboardAnalytics(type: 'accuracy' | 'volume' | 'reputation' = 'accuracy', limit = 50): Promise<ApiResponse<{
    userId: string;
    username: string;
    walletAddress: string;
    rank: number;
    score: number;
    change: number; // Position change from last period
    avatar?: string;
  }[]>> {
    return apiService.get(`/analytics/leaderboard?type=${type}&limit=${limit}`);
  }

  /**
   * Get prediction accuracy insights
   */
  async getAccuracyInsights(userId?: string): Promise<ApiResponse<{
    overallAccuracy: number;
    categoryBreakdown: {
      category: string;
      accuracy: number;
      predictions: number;
    }[];
    timeframeBest: string; // Best performing timeframe
    streakCurrent: number;
    streakLongest: number;
    improvementSuggestions: string[];
  }>> {
    const url = userId ? `/analytics/accuracy/${userId}` : '/analytics/accuracy';
    return apiService.get(url);
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(type: 'user' | 'market' | 'platform', id?: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const url = id ? `/analytics/export/${type}/${id}` : `/analytics/export/${type}`;
    const response = await apiService.get(url, {
      params: { format },
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  /**
   * Subscribe to real-time analytics updates
   */
  subscribeToAnalytics(type: 'platform' | 'market' | 'user', id?: string): EventSource {
    const url = id 
      ? `/analytics/stream/${type}/${id}`
      : `/analytics/stream/${type}`;
    
    return new EventSource(`${apiService['api'].defaults.baseURL}${url}`, {
      withCredentials: true,
    });
  }
}

export const analyticsService = new AnalyticsService();
export { AnalyticsService };