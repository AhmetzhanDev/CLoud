import { UserModel } from '../models/User';
import { getDatabase } from '../config/database';
import { queryOne } from '../utils/db';

export enum AchievementId {
  FIRST_ARTICLE = 'first-article',
  FIRST_SUMMARY = 'first-summary',
  FIRST_QUIZ = 'first-quiz',
  PERFECT_SCORE = 'perfect-score',
  TEN_ARTICLES = 'ten-articles',
  LEVEL_5 = 'level-5',
  HUNDRED_NOTES = 'hundred-notes',
}

interface AchievementCondition {
  check: (userId: string) => boolean;
  achievementId: AchievementId;
}

export class AchievementsService {
  /**
   * Check and unlock achievements for a user based on their activity
   */
  static checkAndUnlockAchievements(userId: string): string[] {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const unlockedAchievements: string[] = [];
    const conditions = this.getAchievementConditions();

    for (const condition of conditions) {
      // Check if user already has this achievement
      const hasAchievement = user.achievements.some(
        (a) => a.id === condition.achievementId
      );

      if (!hasAchievement && condition.check(userId)) {
        const unlocked = UserModel.unlockAchievement(userId, condition.achievementId);
        if (unlocked) {
          unlockedAchievements.push(condition.achievementId);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check specific achievement for a user
   */
  static checkSpecificAchievement(
    userId: string,
    achievementId: AchievementId
  ): boolean {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already unlocked
    const hasAchievement = user.achievements.some((a) => a.id === achievementId);
    if (hasAchievement) {
      return false;
    }

    const conditions = this.getAchievementConditions();
    const condition = conditions.find((c) => c.achievementId === achievementId);

    if (condition && condition.check(userId)) {
      return UserModel.unlockAchievement(userId, achievementId);
    }

    return false;
  }

  /**
   * Calculate user level based on points
   */
  static calculateLevel(points: number): number {
    return Math.floor(points / 100) + 1;
  }

  /**
   * Get points required for next level
   */
  static getPointsForNextLevel(currentPoints: number): number {
    const currentLevel = this.calculateLevel(currentPoints);
    const nextLevelPoints = currentLevel * 100;
    return nextLevelPoints - currentPoints;
  }

  /**
   * Update user level if they have enough points
   */
  static updateUserLevel(userId: string): boolean {
    const user = UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newLevel = this.calculateLevel(user.points);
    
    if (newLevel > user.level) {
      UserModel.update(userId, { level: newLevel });
      
      // Check for level-based achievements
      if (newLevel >= 5) {
        this.checkSpecificAchievement(userId, AchievementId.LEVEL_5);
      }
      
      return true;
    }

    return false;
  }

  /**
   * Get all achievement conditions
   */
  private static getAchievementConditions(): AchievementCondition[] {
    return [
      {
        achievementId: AchievementId.FIRST_ARTICLE,
        check: (userId: string) => this.countUserArticles(userId) >= 1,
      },
      {
        achievementId: AchievementId.FIRST_SUMMARY,
        check: (userId: string) => this.countUserSummaries(userId) >= 1,
      },
      {
        achievementId: AchievementId.FIRST_QUIZ,
        check: (userId: string) => this.countUserQuizResults(userId) >= 1,
      },
      {
        achievementId: AchievementId.PERFECT_SCORE,
        check: (userId: string) => this.hasPerfectScore(userId),
      },
      {
        achievementId: AchievementId.TEN_ARTICLES,
        check: (userId: string) => this.countUserArticles(userId) >= 10,
      },
      {
        achievementId: AchievementId.LEVEL_5,
        check: (userId: string) => {
          const user = UserModel.findById(userId);
          return user ? user.level >= 5 : false;
        },
      },
      {
        achievementId: AchievementId.HUNDRED_NOTES,
        check: (userId: string) => this.countUserNotes(userId) >= 100,
      },
    ];
  }

  // Helper methods to check conditions
  private static countUserArticles(_userId: string): number {
    const db = getDatabase();
    const result = queryOne(
      db,
      'SELECT COUNT(*) as count FROM articles',
      []
    );
    return result?.count || 0;
  }

  private static countUserSummaries(_userId: string): number {
    const db = getDatabase();
    const result = queryOne(
      db,
      'SELECT COUNT(*) as count FROM summaries',
      []
    );
    return result?.count || 0;
  }

  private static countUserQuizResults(userId: string): number {
    const db = getDatabase();
    const result = queryOne(
      db,
      'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }

  private static hasPerfectScore(userId: string): boolean {
    const db = getDatabase();
    const result = queryOne(
      db,
      'SELECT COUNT(*) as count FROM quiz_results WHERE user_id = ? AND score = 100',
      [userId]
    );
    return (result?.count || 0) > 0;
  }

  private static countUserNotes(userId: string): number {
    const db = getDatabase();
    const result = queryOne(
      db,
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }
}
