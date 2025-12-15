import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/ArticleService';
import { z } from 'zod';

// Validation schemas
const uploadUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  source: z.enum(['upload', 'url', 'arxiv', 'semantic-scholar']).optional(),
});

export class ArticleController {
  /**
   * Upload PDF file
   * POST /api/articles/upload
   */
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide a PDF file',
        });
      }

      const article = await ArticleService.createFromUpload(
        req.file.path,
        req.file.originalname
      );

      res.status(201).json({
        message: 'Article uploaded successfully',
        article,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload from URL
   * POST /api/articles/url
   */
  static async uploadFromUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = uploadUrlSchema.parse(req.body);

      const article = await ArticleService.createFromUrl(url);

      res.status(201).json({
        message: 'Article downloaded and processed successfully',
        article,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * Get all articles with pagination
   * GET /api/articles
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, source } = paginationSchema.parse(req.query);

      const result = await ArticleService.getAll({ page, limit, source });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * Get article by ID
   * GET /api/articles/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const article = await ArticleService.getById(id);

      if (!article) {
        return res.status(404).json({
          error: 'Article not found',
          message: `Article with ID ${id} does not exist`,
        });
      }

      res.json(article);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete article
   * DELETE /api/articles/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleted = await ArticleService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Article not found',
          message: `Article with ID ${id} does not exist`,
        });
      }

      res.json({
        message: 'Article deleted successfully',
        id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get article content
   * GET /api/articles/:id/content
   */
  static async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const article = await ArticleService.getById(id);

      if (!article) {
        return res.status(404).json({
          error: 'Article not found',
          message: `Article with ID ${id} does not exist`,
        });
      }

      res.json({
        id: article.id,
        title: article.title,
        content: article.content,
      });
    } catch (error) {
      next(error);
    }
  }
}
