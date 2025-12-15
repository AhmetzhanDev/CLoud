import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';

const router = Router();

// Generate quiz questions for an article
router.post('/generate', QuizController.generate);

// Submit quiz answers
router.post('/submit', QuizController.submit);

// Get quiz results for a user
router.get('/results/:userId', QuizController.getResults);

// Get quiz explanations
router.get('/:quizId/explanations', QuizController.getExplanations);

export default router;
