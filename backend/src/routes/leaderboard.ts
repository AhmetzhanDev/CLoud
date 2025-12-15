import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';

const router = Router();

// GET /api/leaderboard - Get leaderboard
router.get('/', LeaderboardController.getLeaderboard);

// GET /api/leaderboard/stats - Get leaderboard statistics
router.get('/stats', LeaderboardController.getStats);

export default router;
