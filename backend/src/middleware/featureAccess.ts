import { Request, Response, NextFunction } from 'express';
import { FeatureAccessService, Feature } from '../services/FeatureAccessService';

/**
 * Middleware to check if user has access to a specific feature
 */
export const requireFeature = (feature: Feature) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get userId from query or body
      const userId = (req.query.userId as string) || (req.body.userId as string);

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required to access this feature',
        });
        return;
      }

      // Check if user has access to the feature
      const hasAccess = FeatureAccessService.hasAccess(userId, feature);

      if (!hasAccess) {
        const requiredLevel = FeatureAccessService.getRequiredLevel(feature);
        
        res.status(403).json({
          error: 'Feature locked',
          message: `This feature requires level ${requiredLevel}`,
          feature,
          requiredLevel,
        });
        return;
      }

      // User has access, continue to next middleware/handler
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check minimum user level
 */
export const requireLevel = (minLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = (req.query.userId as string) || (req.body.userId as string);

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required',
        });
        return;
      }

      const { UserModel } = require('../models/User');
      const user = UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'User not found',
          message: 'Invalid user ID',
        });
        return;
      }

      if (user.level < minLevel) {
        res.status(403).json({
          error: 'Insufficient level',
          message: `This action requires level ${minLevel}. Your current level is ${user.level}`,
          requiredLevel: minLevel,
          currentLevel: user.level,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
