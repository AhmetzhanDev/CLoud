import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { upload } from '../config/multer';

const router = Router();

console.log('🔧 Setting up articles routes...');

// Upload PDF file
router.post('/upload', upload.single('file'), ArticleController.uploadFile);

// Upload from URL
router.post('/url', ArticleController.uploadFromUrl);

// Get all articles with pagination
router.get('/', (req, res, next) => {
  console.log('📥 GET /api/articles called');
  ArticleController.getAll(req, res, next);
});

// Get article by ID
router.get('/:id', ArticleController.getById);

// Get article content
router.get('/:id/content', ArticleController.getContent);

// Delete article
router.delete('/:id', ArticleController.delete);

export default router;
