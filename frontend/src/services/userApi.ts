import api from './api';
import type { User, Achievement } from '@shared/types/user';

interface UserProgress {
  level: number;
  points: number;
  nextLevelPoints: number;
  progressPercentage: number;
  recentActivity: Array<{
    date: string;
    action: string;
    points: number;
  }>;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  level: number;
  rank: number;
}

export const userApi = {
  // Get user profile
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/user/profile?userId=${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put('/user/profile', { userId, ...updates });
    return response.data;
  },

  // Get user progress
  getProgress: async (userId: string): Promise<UserProgress> => {
    const response = await api.get(`/user/progress?userId=${userId}`);
    return response.data;
  },

  // Get user achievements
  getAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await api.get(`/user/achievements?userId=${userId}`);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (period?: 'week' | 'month' | 'all'): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/leaderboard', {
      params: { period: period || 'all' },
    });
    return response.data;
  },
};
