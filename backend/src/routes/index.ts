import { Router } from 'express';
import articlesRouter from './articles';
import searchRouter from './search';
import analysisRouter from './analysis';
import directionsRouter from './directions';
import quizRouter from './quiz';
import userRouter from './user';
import leaderboardRouter from './leaderboard';
import notesRouter from './notes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Research Assistant API'
  });
});

// Routes
console.log('📍 Registering routes...');
router.use('/articles', articlesRouter);
console.log('  ✓ /api/articles');
router.use('/search', searchRouter);
console.log('  ✓ /api/search');
router.use('/analysis', analysisRouter);
console.log('  ✓ /api/analysis');
router.use('/directions', directionsRouter);
console.log('  ✓ /api/directions');
router.use('/quiz', quizRouter);
console.log('  ✓ /api/quiz');
router.use('/user', userRouter);
console.log('  ✓ /api/user');
router.use('/leaderboard', leaderboardRouter);
console.log('  ✓ /api/leaderboard');
router.use('/notes', notesRouter);
console.log('  ✓ /api/notes');

export default router;
