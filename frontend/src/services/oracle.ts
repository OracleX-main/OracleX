import { apiService } from './api';
import type {
  OracleEvent,
  Resolution,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

class OracleService {
  /**
   * Get oracle events
   */
  async getOracleEvents(page = 1, limit = 20, marketId?: string): Promise<PaginatedResponse<OracleEvent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (marketId) params.append('marketId', marketId);

    return apiService.get(`/oracles/events?${params.toString()}`);
  }

  /**
   * Get oracle event by ID
   */
  async getOracleEvent(eventId: string): Promise<ApiResponse<OracleEvent>> {
    return apiService.get(`/oracles/events/${eventId}`);
  }

  /**
   * Submit oracle result (for authorized oracles)
   */
  async submitOracleResult(marketId: string, data: any): Promise<ApiResponse<OracleEvent>> {
    return apiService.post('/oracles/submit', {
      marketId,
      data,
    });
  }

  /**
   * Request AI oracle analysis for market
   */
  async requestAIAnalysis(marketId: string): Promise<ApiResponse<{ analysisId: string }>> {
    return apiService.post(`/oracles/analyze/${marketId}`);
  }

  /**
   * Get AI analysis result
   */
  async getAIAnalysis(analysisId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/oracles/analysis/${analysisId}`);
  }

  /**
   * Get market resolution
   */
  async getResolution(marketId: string): Promise<ApiResponse<Resolution>> {
    return apiService.get(`/oracles/resolutions/${marketId}`);
  }

  /**
   * Get all resolutions
   */
  async getResolutions(page = 1, limit = 20): Promise<PaginatedResponse<Resolution>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiService.get(`/oracles/resolutions?${params.toString()}`);
  }

  /**
   * Challenge a resolution
   */
  async challengeResolution(marketId: string, evidence: string): Promise<ApiResponse<null>> {
    return apiService.post(`/oracles/resolutions/${marketId}/challenge`, {
      evidence,
    });
  }

  /**
   * Vote on disputed resolution (for validators)
   */
  async voteOnDispute(marketId: string, vote: 'support' | 'reject', evidence?: string): Promise<ApiResponse<null>> {
    return apiService.post(`/oracles/resolutions/${marketId}/vote`, {
      vote,
      evidence,
    });
  }

  /**
   * Get oracle network status
   */
  async getOracleStatus(): Promise<ApiResponse<{
    activeOracles: number;
    totalEvents: number;
    averageConfidence: number;
    networkHealth: 'healthy' | 'degraded' | 'offline';
  }>> {
    return apiService.get('/oracles/status');
  }

  /**
   * Get oracle network metrics
   */
  async getOracleMetrics(): Promise<ApiResponse<{
    totalResolutions: number;
    accuracy: number;
    averageResolutionTime: number;
    disputeRate: number;
  }>> {
    return apiService.get('/oracles/metrics');
  }

  /**
   * Subscribe to oracle events (WebSocket)
   */
  subscribeToEvents(marketId?: string): EventSource {
    const url = marketId 
      ? `/oracles/events/stream?marketId=${marketId}`
      : '/oracles/events/stream';
    
    return new EventSource(`${apiService['api'].defaults.baseURL}${url}`, {
      withCredentials: true,
    });
  }

  /**
   * Get data sources used by oracle
   */
  async getDataSources(): Promise<ApiResponse<{
    name: string;
    type: string;
    reliability: number;
    lastUpdate: string;
  }[]>> {
    return apiService.get('/oracles/data-sources');
  }

  /**
   * Test oracle connection
   */
  async testOracleConnection(): Promise<ApiResponse<{ status: 'connected' | 'disconnected'; latency: number }>> {
    return apiService.get('/oracles/test');
  }
}

export const oracleService = new OracleService();
export { OracleService };