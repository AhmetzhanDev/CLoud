import { Request, Response, NextFunction } from 'express';
import { ArxivService } from '../services/ArxivService';
import { SemanticScholarService } from '../services/SemanticScholarService';

interface UnifiedSearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string | null;
  source: 'arxiv' | 'semantic-scholar';
  sourceId: string;
  pdfUrl?: string;
  citationCount?: number;
  venue?: string;
  categories?: string[];
  fieldsOfStudy?: string[];
}

export class SearchController {
  /**
   * Search arXiv API
   * GET /api/search/arxiv
   */
  static async searchArxiv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        query, 
        maxResults = '10', 
        start = '0',
        sortBy = 'relevance',
        sortOrder = 'descending'
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ 
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
        return;
      }

      const arxivService = new ArxivService();
      const result = await arxivService.search({
        query,
        maxResults: parseInt(maxResults as string, 10),
        start: parseInt(start as string, 10),
        sortBy: sortBy as 'relevance' | 'lastUpdatedDate' | 'submittedDate',
        sortOrder: sortOrder as 'ascending' | 'descending',
      });

      res.json({
        success: true,
        source: 'arxiv',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get article by arXiv ID
   * GET /api/search/arxiv/:id
   */
  static async getArxivById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          error: 'Article ID is required',
          message: 'Please provide an arXiv article ID'
        });
        return;
      }

      const arxivService = new ArxivService();
      const article = await arxivService.getById(id);

      if (!article) {
        res.status(404).json({ 
          error: 'Article not found',
          message: `No article found with ID: ${id}`
        });
        return;
      }

      res.json({
        success: true,
        source: 'arxiv',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search Semantic Scholar API
   * GET /api/search/semantic-scholar
   */
  static async searchSemanticScholar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        query, 
        limit = '10', 
        offset = '0',
        year,
        venue,
        fieldsOfStudy
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ 
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
        return;
      }

      const semanticScholarService = new SemanticScholarService();
      const result = await semanticScholarService.search({
        query,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
        year: year as string,
        venue: venue as string,
        fieldsOfStudy: fieldsOfStudy ? (fieldsOfStudy as string).split(',') : undefined,
      });

      res.json({
        success: true,
        source: 'semantic-scholar',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paper by Semantic Scholar ID
   * GET /api/search/semantic-scholar/:id
   */
  static async getSemanticScholarById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          error: 'Paper ID is required',
          message: 'Please provide a Semantic Scholar paper ID'
        });
        return;
      }

      const semanticScholarService = new SemanticScholarService();
      const paper = await semanticScholarService.getById(id);

      if (!paper) {
        res.status(404).json({ 
          error: 'Paper not found',
          message: `No paper found with ID: ${id}`
        });
        return;
      }

      res.json({
        success: true,
        source: 'semantic-scholar',
        data: paper,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import article from external API search results
   * POST /api/search/import
   */
  static async importArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { source, sourceId, title, authors, abstract, pdfUrl, publicationDate, keywords, doi } = req.body;

      // Validate required fields
      if (!source || !sourceId || !title) {
        res.status(400).json({ 
          error: 'Missing required fields',
          message: 'source, sourceId, and title are required'
        });
        return;
      }

      // Validate source
      if (source !== 'arxiv' && source !== 'semantic-scholar') {
        res.status(400).json({ 
          error: 'Invalid source',
          message: 'source must be either "arxiv" or "semantic-scholar"'
        });
        return;
      }

      const { ArticleService } = await import('../services/ArticleService');
      const article = await ArticleService.importFromExternalAPI({
        source,
        sourceId,
        title,
        authors: authors || [],
        abstract: abstract || '',
        pdfUrl,
        publicationDate,
        keywords,
        doi,
      });

      res.status(201).json({
        success: true,
        message: 'Article imported successfully',
        data: article,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already imported')) {
        res.status(409).json({
          error: 'Article already exists',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Unified search across multiple sources with filtering
   * GET /api/search
   */
  static async unifiedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        query,
        sources = 'arxiv,semantic-scholar',
        limit = '10',
        dateFrom,
        dateTo,
        sortBy = 'relevance'
      } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ 
          error: 'Query parameter is required',
          message: 'Please provide a search query'
        });
        return;
      }

      const sourcesArray = (sources as string).split(',').map(s => s.trim());
      const limitNum = parseInt(limit as string, 10);
      const resultsPerSource = Math.ceil(limitNum / sourcesArray.length);

      const results: UnifiedSearchResult[] = [];
      const errors: { source: string; error: string }[] = [];

      // Search arXiv if requested
      if (sourcesArray.includes('arxiv')) {
        try {
          const arxivService = new ArxivService();
          const arxivResults = await arxivService.search({
            query: query as string,
            maxResults: resultsPerSource,
            sortBy: sortBy === 'date' ? 'submittedDate' : 'relevance',
            sortOrder: 'descending',
          });

          // Filter by date if specified
          let filteredEntries = arxivResults.entries;
          if (dateFrom || dateTo) {
            filteredEntries = filteredEntries.filter(entry => {
              const pubDate = new Date(entry.publicationDate);
              if (dateFrom && pubDate < new Date(dateFrom as string)) return false;
              if (dateTo && pubDate > new Date(dateTo as string)) return false;
              return true;
            });
          }

          // Convert to unified format
          results.push(...filteredEntries.map(entry => ({
            id: entry.id,
            title: entry.title,
            authors: entry.authors,
            abstract: entry.abstract,
            publicationDate: entry.publicationDate,
            source: 'arxiv' as const,
            sourceId: entry.id,
            pdfUrl: entry.pdfUrl,
            categories: entry.categories,
          })));
        } catch (error) {
          errors.push({
            source: 'arxiv',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Search Semantic Scholar if requested
      if (sourcesArray.includes('semantic-scholar')) {
        try {
          const semanticScholarService = new SemanticScholarService();
          const ssResults = await semanticScholarService.search({
            query: query as string,
            limit: resultsPerSource,
          });

          // Filter by date if specified
          let filteredPapers = ssResults.papers;
          if (dateFrom || dateTo) {
            filteredPapers = filteredPapers.filter(paper => {
              if (!paper.publicationDate) return false;
              const pubDate = new Date(paper.publicationDate);
              if (dateFrom && pubDate < new Date(dateFrom as string)) return false;
              if (dateTo && pubDate > new Date(dateTo as string)) return false;
              return true;
            });
          }

          // Convert to unified format
          results.push(...filteredPapers.map(paper => ({
            id: paper.paperId,
            title: paper.title,
            authors: paper.authors.map(a => a.name),
            abstract: paper.abstract || '',
            publicationDate: paper.publicationDate,
            source: 'semantic-scholar' as const,
            sourceId: paper.paperId,
            pdfUrl: paper.openAccessPdf?.url,
            citationCount: paper.citationCount,
            venue: paper.venue || undefined,
            fieldsOfStudy: paper.fieldsOfStudy || undefined,
          })));
        } catch (error) {
          errors.push({
            source: 'semantic-scholar',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Sort results
      if (sortBy === 'date') {
        results.sort((a, b) => {
          const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
          const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
          return dateB - dateA;
        });
      } else if (sortBy === 'citations' && results.some(r => r.citationCount !== undefined)) {
        results.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
      }

      // Limit total results
      const limitedResults = results.slice(0, limitNum);

      res.json({
        success: true,
        data: {
          results: limitedResults,
          total: results.length,
          sources: sourcesArray,
          filters: {
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            sortBy,
          },
        },
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
}
