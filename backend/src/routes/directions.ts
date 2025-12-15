import { Router } from 'express';
import { DirectionsController } from '../controllers/DirectionsController';

const router = Router();

// Get all research directions
router.get('/', DirectionsController.getAll);

// Get research directions by article ID
router.get('/article/:articleId', DirectionsController.getByArticleId);

// Get detailed information about a specific research direction
router.get('/:id', DirectionsController.getById);

// Save/bookmark a research direction
router.post('/:id/save', DirectionsController.save);

// Delete a research direction
router.delete('/:id', DirectionsController.delete);

export default router;
