import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';
import { useUserStore } from '@/store/userStore';

export const useUser = (userId: string) => {
  const { setUser } = useUserStore();

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const user = await userApi.getProfile(userId);
      setUser(user);
      return user;
    },
    enabled: !!userId,
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
  };
};

export const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ['user-progress', userId],
    queryFn: () => userApi.getProgress(userId),
    enabled: !!userId,
  });
};

export const useLeaderboard = (period?: 'week' | 'month' | 'all') => {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => userApi.getLeaderboard(period),
  });
};
