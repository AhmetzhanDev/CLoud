import { Request, Response, NextFunction } from 'express';
import { ResearchDirectionModel } from '../models/ResearchDirection';
import { ArticleModel } from '../models/Article';
import { z } from 'zod';

export class DirectionsController {
  /**
   * Get all research directions
   * GET /api/directions
   */
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const QuerySchema = z.object({
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        offset: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
        sortBy: z.enum(['relevance', 'novelty', 'created']).optional(),
      });

      const { limit, offset, sortBy } = QuerySchema.parse(req.query);

      const directions = ResearchDirectionModel.findAll({
        limit,
        offset,
        sortBy,
      });

      res.json({
        directions,
        count: directions.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get detailed information about a specific research direction
   * GET /api/directions/:id
   */
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const direction = ResearchDirectionModel.findById(id);
      if (!direction) {
        res.status(404).json({ error: 'Research direction not found' });
        return;
      }

      // Fetch associated articles for additional context
      const articles = direction.articleIds
        .map(articleId => ArticleModel.findById(articleId))
        .filter(article => article !== null)
        .map(article => ({
          id: article!.id,
          title: article!.title,
          authors: article!.authors,
          publicationDate: article!.publicationDate,
        }));

      res.json({
        ...direction,
        articles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get research directions by article ID
   * GET /api/directions/article/:articleId
   */
  static async getByArticleId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { articleId } = req.params;

      // Verify article exists
      const article = ArticleModel.findById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      const directions = ResearchDirectionModel.findByArticleId(articleId);

      res.json({
        articleId,
        directions,
        count: directions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save/bookmark a research direction (placeholder for future user-specific features)
   * POST /api/directions/:id/save
   */
  static async save(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const SaveRequestSchema = z.object({
        userId: z.string().uuid().optional(),
        notes: z.string().optional(),
      });

      const { userId, notes } = SaveRequestSchema.parse(req.body);

      // Verify direction exists
      const direction = ResearchDirectionModel.findById(id);
      if (!direction) {
        res.status(404).json({ error: 'Research direction not found' });
        return;
      }

      // For now, just return success
      // In the future, this would save to a user_saved_directions table
      res.json({
        message: 'Research direction saved successfully',
        directionId: id,
        userId: userId || 'default',
        notes: notes || '',
        savedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete a research direction
   * DELETE /api/directions/:id
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = ResearchDirectionModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Research direction not found' });
        return;
      }

      res.json({ message: 'Research direction deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
