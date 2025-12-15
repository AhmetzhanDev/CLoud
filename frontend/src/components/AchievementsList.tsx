import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';
import { useUserStore } from '@/store/userStore';
import { Lock, CheckCircle, Trophy } from 'lucide-react';
import type { Achievement } from '@shared/types/user';

export default function AchievementsList() {
  const { user } = useUserStore();
  const userId = user?.id || 'default-user';

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => userApi.getAchievements(userId),
  });

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-gray-600">Loading achievements...</p>
      </div>
    );
  }

  const unlockedAchievements = achievements?.filter((a) => a.unlockedAt) || [];
  const lockedAchievements = achievements?.filter((a) => !a.unlockedAt) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-gray-600 mt-1">
            {unlockedAchievements.length} of {achievements?.length || 0} unlocked
          </p>
        </div>
        <Trophy className="w-8 h-8 text-yellow-500" />
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Unlocked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Locked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!achievements || achievements.length === 0 && (
        <div className="card text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No achievements available yet</p>
        </div>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  return (
    <div
      className={`
        card relative overflow-hidden transition-all duration-300
        ${isUnlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg hover:scale-105' 
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
      `}
    >
      {/* Unlock Animation Effect */}
      {isUnlocked && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-bl-full" />
      )}

      <div className="relative">
        {/* Icon */}
        <div className="flex items-center justify-between mb-3">
          <div
            className={`
              text-4xl w-14 h-14 flex items-center justify-center rounded-full
              ${isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'}
            `}
          >
            {achievement.icon}
          </div>
          {isUnlocked ? (
            <CheckCircle className="w-6 h-6 text-green-500 animate-bounce-once" />
          ) : (
            <Lock className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <h4 className={`font-semibold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
          {achievement.name}
        </h4>
        <p className={`text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
          {achievement.description}
        </p>

        {/* Unlock Date */}
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
