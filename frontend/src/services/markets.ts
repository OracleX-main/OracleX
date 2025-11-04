import { apiService } from './api';
import type {
  Market,
  Prediction,
  CreateMarketRequest,
  CreatePredictionRequest,
  ApiResponse,
  PaginatedResponse,
  MarketStatus,
} from '../types/api';

class MarketService {
  /**
   * Get all markets with pagination and filters
   */
  async getMarkets(
    page = 1,
    limit = 20,
    category?: string,
    status?: MarketStatus,
    search?: string
  ): Promise<PaginatedResponse<Market>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    return apiService.get(`/markets?${params.toString()}`);
  }

  /**
   * Get market by ID
   */
  async getMarket(marketId: string): Promise<ApiResponse<Market>> {
    return apiService.get(`/markets/${marketId}`);
  }

  /**
   * Create new market
   */
  async createMarket(marketData: CreateMarketRequest): Promise<ApiResponse<Market>> {
    return apiService.post('/markets', marketData);
  }

  /**
   * Update market (only by creator or admin)
   */
  async updateMarket(marketId: string, updates: Partial<Market>): Promise<ApiResponse<Market>> {
    return apiService.put(`/markets/${marketId}`, updates);
  }

  /**
   * Delete market
   */
  async deleteMarket(marketId: string): Promise<ApiResponse<null>> {
    return apiService.delete(`/markets/${marketId}`);
  }

  /**
   * Get trending markets
   */
  async getTrendingMarkets(limit = 10): Promise<ApiResponse<Market[]>> {
    return apiService.get(`/markets/trending?limit=${limit}`);
  }

  /**
   * Get featured markets
   */
  async getFeaturedMarkets(limit = 5): Promise<ApiResponse<Market[]>> {
    return apiService.get(`/markets/featured?limit=${limit}`);
  }

  /**
   * Get markets by category
   */
  async getMarketsByCategory(category: string, page = 1, limit = 20): Promise<PaginatedResponse<Market>> {
    return apiService.get(`/markets/category/${category}?page=${page}&limit=${limit}`);
  }

  /**
   * Get user's created markets
   */
  async getUserMarkets(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Market>> {
    return apiService.get(`/users/${userId}/markets?page=${page}&limit=${limit}`);
  }

  /**
   * Get user's predictions
   */
  async getUserPredictions(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Prediction>> {
    return apiService.get(`/users/${userId}/predictions?page=${page}&limit=${limit}`);
  }

  /**
   * Create prediction/bet on market
   */
  async createPrediction(predictionData: CreatePredictionRequest): Promise<ApiResponse<Prediction>> {
    return apiService.post('/markets/predictions', predictionData);
  }

  /**
   * Get predictions for a market
   */
  async getMarketPredictions(marketId: string, page = 1, limit = 20): Promise<PaginatedResponse<Prediction>> {
    return apiService.get(`/markets/${marketId}/predictions?page=${page}&limit=${limit}`);
  }

  /**
   * Cancel prediction (if allowed)
   */
  async cancelPrediction(predictionId: string): Promise<ApiResponse<Prediction>> {
    return apiService.patch(`/predictions/${predictionId}/cancel`);
  }

  /**
   * Claim rewards from winning prediction
   */
  async claimRewards(predictionId: string): Promise<ApiResponse<Prediction>> {
    return apiService.post(`/predictions/${predictionId}/claim`);
  }

  /**
   * Search markets
   */
  async searchMarkets(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Market>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get(`/markets/search?${params.toString()}`);
  }

  /**
   * Get market categories
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiService.get('/markets/categories');
  }

  /**
   * Resolve market (admin/oracle only)
   */
  async resolveMarket(marketId: string, outcome: string, confidence?: number): Promise<ApiResponse<Market>> {
    return apiService.post(`/markets/${marketId}/resolve`, {
      outcome,
      confidence,
    });
  }

  /**
   * Dispute market resolution
   */
  async disputeMarket(marketId: string, reason: string): Promise<ApiResponse<null>> {
    return apiService.post(`/markets/${marketId}/dispute`, {
      reason,
    });
  }
}

export const marketService = new MarketService();
export { MarketService };