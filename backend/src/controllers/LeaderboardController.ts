import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import { queryAll } from '../utils/db';
import { UserModel } from '../models/User';

export class LeaderboardController {
  /**
   * GET /api/leaderboard
   * Get leaderboard with optional time period filter
   */
  static async getLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const period = (req.query.period as string) || 'all-time';
      const limit = parseInt(req.query.limit as string) || 100;
      const currentUserId = req.query.userId as string;

      // Validate period
      const validPeriods = ['week', 'month', 'all-time'];
      if (!validPeriods.includes(period)) {
        res.status(400).json({
          error: 'Invalid period',
          message: `Period must be one of: ${validPeriods.join(', ')}`,
        });
        return;
      }

      const db = getDatabase();
      let dateFilter = '';
      const params: any[] = [];

      // Calculate date filter based on period
      if (period === 'week') {
        dateFilter = "AND u.created_at >= datetime('now', '-7 days')";
      } else if (period === 'month') {
        dateFilter = "AND u.created_at >= datetime('now', '-30 days')";
      }

      // Get leaderboard data
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.level,
          u.points,
          u.created_at,
          COUNT(DISTINCT ua.achievement_id) as achievement_count
        FROM users u
        LEFT JOIN user_achievements ua ON u.id = ua.user_id
        WHERE 1=1 ${dateFilter}
        GROUP BY u.id
        ORDER BY u.points DESC, u.level DESC
        LIMIT ?
      `;

      params.push(limit);

      const rows = queryAll(db, query, params);

      // Format leaderboard entries with rank
      const leaderboard = rows.map((row, index) => ({
        rank: index + 1,
        userId: row.id,
        name: row.name,
        level: row.level,
        points: row.points,
        achievementCount: row.achievement_count,
        isCurrentUser: currentUserId ? row.id === currentUserId : false,
      }));

      // Find current user's rank if not in top results
      let currentUserRank = null;
      if (currentUserId) {
        const userInLeaderboard = leaderboard.find(
          (entry) => entry.userId === currentUserId
        );

        if (!userInLeaderboard) {
          // Calculate user's rank
          const rankQuery = `
            SELECT COUNT(*) + 1 as rank
            FROM users
            WHERE points > (SELECT points FROM users WHERE id = ?)
          `;
          const rankResult = queryAll(db, rankQuery, [currentUserId]);
          if (rankResult.length > 0) {
            currentUserRank = {
              rank: rankResult[0].rank,
              ...UserModel.findById(currentUserId),
            };
          }
        }
      }

      res.json({
        period,
        leaderboard,
        currentUserRank,
        metadata: {
          total: leaderboard.length,
          limit,
          period,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/leaderboard/stats
   * Get overall leaderboard statistics
   */
  static async getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const db = getDatabase();

      // Get total users
      const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
      const totalUsersResult = queryAll(db, totalUsersQuery, []);
      const totalUsers = totalUsersResult[0]?.count || 0;

      // Get average level
      const avgLevelQuery = 'SELECT AVG(level) as avg FROM users';
      const avgLevelResult = queryAll(db, avgLevelQuery, []);
      const averageLevel = Math.round(avgLevelResult[0]?.avg || 1);

      // Get average points
      const avgPointsQuery = 'SELECT AVG(points) as avg FROM users';
      const avgPointsResult = queryAll(db, avgPointsQuery, []);
      const averagePoints = Math.round(avgPointsResult[0]?.avg || 0);

      // Get top user
      const topUserQuery = `
        SELECT id, name, level, points
        FROM users
        ORDER BY points DESC, level DESC
        LIMIT 1
      `;
      const topUserResult = queryAll(db, topUserQuery, []);
      const topUser = topUserResult[0] || null;

      // Get total achievements unlocked
      const totalAchievementsQuery = 'SELECT COUNT(*) as count FROM user_achievements';
      const totalAchievementsResult = queryAll(db, totalAchievementsQuery, []);
      const totalAchievementsUnlocked = totalAchievementsResult[0]?.count || 0;

      res.json({
        totalUsers,
        averageLevel,
        averagePoints,
        topUser,
        totalAchievementsUnlocked,
      });
    } catch (error) {
      next(error);
    }
  }
}
