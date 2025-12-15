import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useUser';
import { useUserStore } from '@/store/userStore';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

type Period = 'week' | 'month' | 'all';

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('all');
  const { user } = useUserStore();
  const { data: leaderboard, isLoading } = useLeaderboard(period);

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
        </div>
        
        {/* Period Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      {leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.userId === user?.id;
            const isTopThree = entry.rank <= 3;

            return (
              <div
                key={entry.userId}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all
                  ${isCurrentUser 
                    ? 'bg-blue-50 border-2 border-blue-300 shadow-md' 
                    : isTopThree
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12">
                  {entry.rank === 1 && (
                    <Crown className="w-8 h-8 text-yellow-500" />
                  )}
                  {entry.rank === 2 && (
                    <Medal className="w-8 h-8 text-gray-400" />
                  )}
                  {entry.rank === 3 && (
                    <Medal className="w-8 h-8 text-orange-600" />
                  )}
                  {entry.rank > 3 && (
                    <span className="text-xl font-bold text-gray-600">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">Level {entry.level}</p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xl font-bold text-gray-900">
                      {entry.points.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No leaderboard data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Be the first to earn points and climb the ranks!
          </p>
        </div>
      )}

      {/* Current User Position (if not in top list) */}
      {user && leaderboard && leaderboard.length > 0 && !leaderboard.some(e => e.userId === user.id) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Your Position</p>
          <div className="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12">
              <span className="text-xl font-bold text-gray-600">-</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">{user.name}</p>
              <p className="text-sm text-gray-600">Level {user.level}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xl font-bold text-gray-900">
                  {user.points.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
