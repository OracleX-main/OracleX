import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth token if unauthorized
          localStorage.removeItem('auth_token');
          // Redirect to home or login
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.api.request<T>(config);
    return response.data;
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // Market-specific methods
  async createMarket(marketData: any): Promise<any> {
    return this.post('/markets', marketData);
  }

  async getMarkets(): Promise<any[]> {
    return this.get('/markets');
  }

  async getMarket(id: string | number): Promise<any> {
    return this.get(`/markets/${id}`);
  }

  // User-specific methods
  async getUserProfile(): Promise<any> {
    return this.get('/users/profile');
  }

  async getUserPortfolio(): Promise<any> {
    return this.get('/users/portfolio');
  }

  async getUserTransactions(page: number = 1, limit: number = 20): Promise<any> {
    return this.get(`/users/transactions?page=${page}&limit=${limit}`);
  }

  async getLeaderboard(limit: number = 50, period: string = 'all'): Promise<any> {
    return this.get(`/users/leaderboard?limit=${limit}&period=${period}`);
  }

  // Analytics methods
  async getAnalyticsOverview(): Promise<any> {
    return this.get('/analytics/overview');
  }

  async getAnalyticsVolume(period: string = '30d'): Promise<any> {
    return this.get(`/analytics/volume?period=${period}`);
  }

  // Staking methods
  async getStakingInfo(address: string): Promise<any> {
    return this.get(`/staking/info/${address}`);
  }

  async getStakingOverview(): Promise<any> {
    return this.get('/staking/overview');
  }

  async getValidators(): Promise<any> {
    return this.get('/staking/validators');
  }

  async getValidatorInfo(address: string): Promise<any> {
    return this.get(`/staking/validator/${address}`);
  }

  // Governance methods
  async getProposals(status?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    return this.get(`/governance/proposals?${params.toString()}`);
  }

  async getActiveProposals(): Promise<any> {
    return this.get('/governance/proposals/active');
  }

  async getProposal(id: number): Promise<any> {
    return this.get(`/governance/proposals/${id}`);
  }

  async getProposalVote(proposalId: number, address: string): Promise<any> {
    return this.get(`/governance/proposals/${proposalId}/votes/${address}`);
  }

  async getVotingPower(address: string): Promise<any> {
    return this.get(`/governance/voting-power/${address}`);
  }

  async canVoteOnProposal(proposalId: number, address: string): Promise<any> {
    return this.get(`/governance/can-vote/${proposalId}/${address}`);
  }

  async getGovernanceStats(): Promise<any> {
    return this.get('/governance/stats');
  }

  // Dispute methods
  async getDisputes(status?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    return this.get(`/disputes?${params.toString()}`);
  }

  async getActiveDisputes(): Promise<any> {
    return this.get('/disputes/active');
  }

  async getDispute(id: number): Promise<any> {
    return this.get(`/disputes/${id}`);
  }

  async getDisputeVote(disputeId: number, address: string): Promise<any> {
    return this.get(`/disputes/${disputeId}/votes/${address}`);
  }

  async getDisputeVoters(disputeId: number): Promise<any> {
    return this.get(`/disputes/${disputeId}/voters`);
  }

  async canVoteOnDispute(disputeId: number, address: string): Promise<any> {
    return this.get(`/disputes/can-vote/${disputeId}/${address}`);
  }

  async getDisputeStats(): Promise<any> {
    return this.get('/disputes/stats');
  }
}

export const apiService = new ApiService();
export default apiService;