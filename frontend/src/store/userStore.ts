import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Achievement } from '@shared/types/user';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  addPoints: (points: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      addPoints: (points) =>
        set((state) => {
          if (!state.user) return state;
          const newPoints = state.user.points + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return {
            user: {
              ...state.user,
              points: newPoints,
              level: newLevel,
            },
          };
        }),

      unlockAchievement: (achievement) =>
        set((state) => {
          if (!state.user) return state;
          const exists = state.user.achievements.some((a) => a.id === achievement.id);
          if (exists) return state;
          return {
            user: {
              ...state.user,
              achievements: [...state.user.achievements, achievement],
            },
          };
        }),

      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
