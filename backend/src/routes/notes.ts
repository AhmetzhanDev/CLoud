import { Router } from 'express';
import { NotesController } from '../controllers/NotesController';

const router = Router();

// Create a new note
router.post('/', NotesController.create);

// Export notes to text format (must be before /:id to avoid route conflict)
router.get('/export', NotesController.export);

// Get notes grouped by article
router.get('/grouped', NotesController.getGroupedByArticle);

// Search notes by content and tags
router.get('/search', NotesController.search);

// Get all notes for a specific article
router.get('/article/:articleId', NotesController.getByArticleId);

// Get all notes with filtering
router.get('/', NotesController.getAll);

// Get a single note by ID
router.get('/:id', NotesController.getById);

// Update a note
router.put('/:id', NotesController.update);

// Delete a note
router.delete('/:id', NotesController.delete);

export default router;
