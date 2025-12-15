import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';

const router = Router();

// Unified search with filtering
router.get('/', SearchController.unifiedSearch);

// arXiv search endpoints
router.get('/arxiv', SearchController.searchArxiv);
router.get('/arxiv/:id', SearchController.getArxivById);

// Semantic Scholar search endpoints
router.get('/semantic-scholar', SearchController.searchSemanticScholar);
router.get('/semantic-scholar/:id', SearchController.getSemanticScholarById);

// Import article from external API
router.post('/import', SearchController.importArticle);

export default router;
