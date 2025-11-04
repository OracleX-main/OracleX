import { apiService } from './api';
import type {
  User,
  ApiResponse,
  PaginatedResponse,
} from '../types/api';

class AuthService {
  /**
   * Authenticate user with wallet address
   */
  async login(walletAddress: string, signature: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiService.post('/auth/login', {
      walletAddress,
      signature,
    });
  }

  /**
   * Register new user
   */
  async register(walletAddress: string, signature: string, userData?: Partial<User>): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiService.post('/auth/register', {
      walletAddress,
      signature,
      ...userData,
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiService.post('/auth/refresh');
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get('/auth/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put('/auth/profile', userData);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token');
    }
  }
}

class UserService {
  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return apiService.get(`/users/${userId}`);
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<ApiResponse<User>> {
    return apiService.get(`/users/wallet/${walletAddress}`);
  }

  /**
   * Get users with pagination
   */
  async getUsers(page = 1, limit = 20, search?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return apiService.get(`/users?${params.toString()}`);
  }

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<ApiResponse<null>> {
    return apiService.post(`/users/${userId}/follow`);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<ApiResponse<null>> {
    return apiService.delete(`/users/${userId}/follow`);
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string): Promise<ApiResponse<User[]>> {
    return apiService.get(`/users/${userId}/followers`);
  }

  /**
   * Get user's following
   */
  async getFollowing(userId: string): Promise<ApiResponse<User[]>> {
    return apiService.get(`/users/${userId}/following`);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'reputation' | 'winnings' | 'accuracy' = 'reputation', limit = 50): Promise<ApiResponse<User[]>> {
    return apiService.get(`/users/leaderboard?type=${type}&limit=${limit}`);
  }
}

export const authService = new AuthService();
export const userService = new UserService();
export { AuthService, UserService };