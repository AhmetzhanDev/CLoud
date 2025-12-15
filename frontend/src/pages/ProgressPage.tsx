import { useUserStore } from '@/store/userStore';
import { useUserProgress } from '@/hooks/useUser';
import { Trophy, TrendingUp, Award, Activity } from 'lucide-react';
import AchievementsList from '@/components/AchievementsList';
import Leaderboard from '@/components/Leaderboard';

export default function ProgressPage() {
  const { user } = useUserStore();
  const userId = user?.id || 'default-user';
  const { data: progress, isLoading } = useUserProgress(userId);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Progress</h1>
        <div className="card">
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.progressPercentage || 0;
  const currentLevel = user?.level || 1;
  const currentPoints = user?.points || 0;
  const nextLevelPoints = progress?.nextLevelPoints || 100;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Progress</h1>

      {/* Level and Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Current Level</p>
              <p className="text-4xl font-bold">{currentLevel}</p>
            </div>
            <Trophy className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Points</p>
              <p className="text-4xl font-bold">{currentPoints}</p>
            </div>
            <Award className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Achievements</p>
              <p className="text-4xl font-bold">{user?.achievements.length || 0}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Progress to Level {currentLevel + 1}</h2>
          <span className="text-sm text-gray-600">
            {currentPoints} / {nextLevelPoints} points
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {nextLevelPoints - currentPoints} points until next level
        </p>
      </div>

      {/* Recent Activity */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        {progress?.recentActivity && progress.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {progress.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-green-600">+{activity.points}</span>
                  <span className="text-xs text-gray-500">pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start analyzing articles and taking quizzes to earn points!
            </p>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="mb-6">
        <AchievementsList />
      </div>

      {/* Leaderboard Section */}
      <Leaderboard />
    </div>
  );
}
