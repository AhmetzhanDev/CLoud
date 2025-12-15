import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// GET /api/user/progress - Get user progress
router.get('/progress', UserController.getProgress);

// GET /api/user/achievements - Get user achievements
router.get('/achievements', UserController.getAchievements);

// GET /api/user/profile - Get user profile
router.get('/profile', UserController.getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', UserController.updateProfile);

// GET /api/user/features - Get user features access
router.get('/features', UserController.getFeatures);

export default router;
