import { Router } from 'express';
import { AnalysisController } from '../controllers/AnalysisController';

const router = Router();

// Generate or retrieve summary for an article
router.post('/summarize', AnalysisController.summarize);

// Generate research directions based on articles
router.post('/directions', AnalysisController.generateDirections);

// Get summary by article ID
router.get('/:articleId', AnalysisController.getSummary);

// Export summary as text file
router.get('/:articleId/export', AnalysisController.exportSummary);

export default router;
