import axios, { AxiosError } from 'axios';
import { Story, User, MediaFile } from '../types';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'kinfolk-auth-token';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
};

// Initialize token from localStorage on app start
const storedToken = getAuthToken();
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it
      clearAuthToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const ApiService = {
  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async register(username: string, email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
        username,
        email,
        password,
        name,
      });

      if (response.data.success && response.data.data?.token) {
        setAuthToken(response.data.data.token);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logout() {
    clearAuthToken();
  },

  // Stories
  async getStories(): Promise<ApiResponse<Story[]>> {
    try {
      const response = await api.get<ApiResponse<Story[]>>('/api/stories');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch stories' };
    }
  },

  async createStory(
    userId: number,
    content: string,
    media?: MediaFile[],
    channelId?: number,
    parentId?: number
  ): Promise<ApiResponse<Story>> {
    try {
      const response = await api.post<ApiResponse<Story>>('/api/stories', {
        content,
        channelId,
        parentId,
        media,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to create story' };
    }
  },

  async updateStory(storyId: number, content: string): Promise<ApiResponse<Story>> {
    try {
      const response = await api.put<ApiResponse<Story>>(`/api/stories/${storyId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to update story' };
    }
  },

  async deleteStory(storyId: number, userId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(`/api/stories/${storyId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to delete story' };
    }
  },

  async toggleLike(storyId: number, userId: number): Promise<ApiResponse<Story>> {
    try {
      const response = await api.post<ApiResponse<Story>>(`/api/stories/${storyId}/like`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to toggle like' };
    }
  },

  // Users
  async getUserProfile(userId: number): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<ApiResponse<User>>(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch user profile' };
    }
  },

  async updateUserProfile(
    userId: number,
    updates: Partial<Pick<User, 'name' | 'bio' | 'location' | 'website' | 'themeId'>>
  ): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<ApiResponse<User>>(`/api/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to update profile' };
    }
  },

  // Channels
  async getChannels(userId?: number): Promise<ApiResponse> {
    try {
      const url = userId ? `/api/channels?userId=${userId}` : '/api/channels';
      const response = await api.get<ApiResponse>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch channels' };
    }
  },

  async getChannel(channelId: number): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(`/api/channels/${channelId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch channel' };
    }
  },

  async createChannel(name: string, description?: string, isPrivate?: boolean): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/api/channels', {
        name,
        description,
        isPrivate,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to create channel' };
    }
  },

  async updateChannel(
    channelId: number,
    updates: { name?: string; description?: string; isPrivate?: boolean }
  ): Promise<ApiResponse> {
    try {
      const response = await api.put<ApiResponse>(`/api/channels/${channelId}`, updates);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to update channel' };
    }
  },

  async deleteChannel(channelId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(`/api/channels/${channelId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to delete channel' };
    }
  },

  async getChannelStories(channelId: number, page?: number, limit?: number): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const url = `/api/channels/${channelId}/stories${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<ApiResponse>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch channel stories' };
    }
  },

  // Subscriptions
  async subscribeToChannel(channelId: number): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(`/api/subscriptions/channels/${channelId}/subscribe`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to subscribe to channel' };
    }
  },

  async unsubscribeFromChannel(channelId: number): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(`/api/subscriptions/channels/${channelId}/unsubscribe`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to unsubscribe from channel' };
    }
  },

  async getChannelSubscribers(channelId: number): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>(`/api/subscriptions/channels/${channelId}/subscribers`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch channel subscribers' };
    }
  },

  async removeSubscriber(channelId: number, subscriberId: number): Promise<ApiResponse> {
    try {
      const response = await api.delete<ApiResponse>(
        `/api/subscriptions/channels/${channelId}/subscribers/${subscriberId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to remove subscriber' };
    }
  },

  async approveSubscription(subscriptionId: number): Promise<ApiResponse> {
    try {
      const response = await api.put<ApiResponse>(`/api/subscriptions/${subscriptionId}/approve`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to approve subscription' };
    }
  },

  async rejectSubscription(subscriptionId: number): Promise<ApiResponse> {
    try {
      const response = await api.put<ApiResponse>(`/api/subscriptions/${subscriptionId}/reject`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to reject subscription' };
    }
  },

  async getUserSubscriptions(): Promise<ApiResponse> {
    try {
      const response = await api.get<ApiResponse>('/api/subscriptions/user');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      return { success: false, error: 'Failed to fetch user subscriptions' };
    }
  },
};

export default api;
