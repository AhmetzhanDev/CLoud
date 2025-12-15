import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AchievementsService } from '../services/AchievementsService';
import { FeatureAccessService } from '../services/FeatureAccessService';

export class UserController {
  /**
   * GET /api/user/progress
   * Get user progress including level, points, and next level info
   */
  static async getProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide userId as query parameter',
        });
        return;
      }

      const user = UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} does not exist`,
        });
        return;
      }

      const pointsForNextLevel = AchievementsService.getPointsForNextLevel(user.points);
      const currentLevelPoints = (user.level - 1) * 100;
      const nextLevelPoints = user.level * 100;
      const progressPercentage = ((user.points - currentLevelPoints) / 100) * 100;

      res.json({
        userId: user.id,
        name: user.name,
        level: user.level,
        points: user.points,
        nextLevel: {
          level: user.level + 1,
          pointsRequired: nextLevelPoints,
          pointsRemaining: pointsForNextLevel,
          progressPercentage: Math.min(progressPercentage, 100),
        },
        statistics: {
          totalAchievements: user.achievements.length,
          unlockedAchievements: user.achievements.filter(a => a.unlockedAt).length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/user/achievements
   * Get all achievements with unlock status for a user
   */
  static async getAchievements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide userId as query parameter',
        });
        return;
      }

      const user = UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} does not exist`,
        });
        return;
      }

      // Get all available achievements
      const allAchievements = UserModel.getAllAchievements();

      // Map achievements with unlock status
      const achievementsWithStatus = allAchievements.map((achievement) => {
        const userAchievement = user.achievements.find(
          (a) => a.id === achievement.id
        );

        return {
          ...achievement,
          unlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlockedAt,
        };
      });

      res.json({
        userId: user.id,
        achievements: achievementsWithStatus,
        summary: {
          total: allAchievements.length,
          unlocked: user.achievements.length,
          locked: allAchievements.length - user.achievements.length,
          completionPercentage: (user.achievements.length / allAchievements.length) * 100,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/user/profile
   * Get user profile
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide userId as query parameter',
        });
        return;
      }

      const user = UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} does not exist`,
        });
        return;
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/user/profile
   * Update user profile
   */
  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const { name, email } = req.body;

      if (!userId) {
        res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide userId as query parameter',
        });
        return;
      }

      const updates: { name?: string; email?: string } = {};
      if (name) updates.name = name;
      if (email) updates.email = email;

      const updatedUser = UserModel.update(userId, updates);

      if (!updatedUser) {
        res.status(404).json({
          error: 'User not found',
          message: `User with ID ${userId} does not exist`,
        });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/user/features
   * Get all features with access status for a user
   */
  static async getFeatures(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({
          error: 'User ID is required',
          message: 'Please provide userId as query parameter',
        });
        return;
      }

      const features = FeatureAccessService.getUserFeatures(userId);
      const locked = FeatureAccessService.getLockedFeatures(userId);
      const unlocked = FeatureAccessService.getUnlockedFeatures(userId);

      res.json({
        userId,
        features,
        summary: {
          total: features.length,
          unlocked: unlocked.length,
          locked: locked.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
