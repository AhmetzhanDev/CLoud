import { Request, Response, NextFunction } from 'express';
import { NoteModel } from '../models/Note';
import { ArticleModel } from '../models/Article';
import { CreateNoteSchema, UpdateNoteSchema } from '../../../shared/src/types/note';
import { z } from 'zod';

export class NotesController {
  // POST /api/notes - Create a new note
  static create(req: Request, res: Response, next: NextFunction): void {
    try {
      // Validate request body
      const validatedData = CreateNoteSchema.parse(req.body);

      // Create note
      const note = NoteModel.create(validatedData);

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // GET /api/notes - Get all notes with filtering
  static getAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const { userId, articleId, tag, limit, offset, search } = req.query;

      // If search query is provided, use full-text search
      if (search && typeof search === 'string') {
        const notes = NoteModel.search(
          search,
          userId as string | undefined
        );
        res.json({
          success: true,
          data: notes,
          total: notes.length,
        });
        return;
      }

      // Filter by articleId if provided
      if (articleId && typeof articleId === 'string') {
        const notes = NoteModel.findByArticleId(
          articleId,
          userId as string | undefined
        );
        res.json({
          success: true,
          data: notes,
          total: notes.length,
        });
        return;
      }

      // Get notes by userId with pagination
      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'userId is required when not filtering by articleId',
        });
        return;
      }

      const options = {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      let notes = NoteModel.findByUserId(userId, options);

      // Filter by tag if provided
      if (tag && typeof tag === 'string') {
        notes = notes.filter(note => note.tags.includes(tag));
      }

      const total = NoteModel.countByUserId(userId);

      res.json({
        success: true,
        data: notes,
        total,
        limit: options.limit,
        offset: options.offset,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/:id - Get a single note by ID
  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;

      const note = NoteModel.findById(id);

      if (!note) {
        res.status(404).json({
          success: false,
          error: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/notes/:id - Update a note
  static update(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;

      // Validate request body
      const validatedData = UpdateNoteSchema.parse(req.body);

      // Update note
      const note = NoteModel.update(id, validatedData);

      if (!note) {
        res.status(404).json({
          success: false,
          error: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  // DELETE /api/notes/:id - Delete a note
  static delete(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;

      const deleted = NoteModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Note not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/article/:articleId - Get all notes for a specific article
  static getByArticleId(req: Request, res: Response, next: NextFunction): void {
    try {
      const { articleId } = req.params;
      const { userId } = req.query;

      const notes = NoteModel.findByArticleId(
        articleId,
        userId as string | undefined
      );

      res.json({
        success: true,
        data: notes,
        total: notes.length,
        articleId,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/grouped - Get notes grouped by article
  static getGroupedByArticle(req: Request, res: Response, next: NextFunction): void {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'userId is required',
        });
        return;
      }

      // Get all notes for the user
      const notes = NoteModel.findByUserId(userId);

      // Group notes by articleId
      const grouped = notes.reduce((acc, note) => {
        if (!acc[note.articleId]) {
          acc[note.articleId] = [];
        }
        acc[note.articleId].push(note);
        return acc;
      }, {} as Record<string, typeof notes>);

      res.json({
        success: true,
        data: grouped,
        totalNotes: notes.length,
        totalArticles: Object.keys(grouped).length,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/search - Search notes by content and tags using full-text search
  static search(req: Request, res: Response, next: NextFunction): void {
    try {
      const { q, userId } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query (q) is required',
        });
        return;
      }

      const notes = NoteModel.search(q, userId as string | undefined);

      res.json({
        success: true,
        data: notes,
        total: notes.length,
        query: q,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notes/export - Export notes to text format with article references
  static export(req: Request, res: Response, next: NextFunction): void {
    try {
      const { userId, articleId } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'userId is required',
        });
        return;
      }

      // Get notes based on filters
      let notes;
      if (articleId && typeof articleId === 'string') {
        notes = NoteModel.findByArticleId(articleId, userId);
      } else {
        notes = NoteModel.findByUserId(userId);
      }

      // Group notes by article
      const notesByArticle = notes.reduce((acc, note) => {
        if (!acc[note.articleId]) {
          acc[note.articleId] = [];
        }
        acc[note.articleId].push(note);
        return acc;
      }, {} as Record<string, typeof notes>);

      // Build export text
      let exportText = '# Research Notes Export\n\n';
      exportText += `Generated: ${new Date().toISOString()}\n`;
      exportText += `Total Notes: ${notes.length}\n\n`;
      exportText += '---\n\n';

      // Iterate through articles and their notes
      for (const [artId, artNotes] of Object.entries(notesByArticle)) {
        let article;
        try {
          article = ArticleModel.findById(artId);
        } catch (error) {
          // If article parsing fails, continue without article details
          article = null;
        }
        
        if (article) {
          exportText += `## Article: ${article.title}\n\n`;
          exportText += `**Authors:** ${article.authors.join(', ')}\n`;
          if (article.publicationDate) {
            exportText += `**Publication Date:** ${article.publicationDate}\n`;
          }
          exportText += `**Source:** ${article.source}\n`;
          if (article.url) {
            exportText += `**URL:** ${article.url}\n`;
          }
          exportText += '\n';
        } else {
          exportText += `## Article ID: ${artId}\n\n`;
          exportText += '*(Article details not available)*\n\n';
        }

        exportText += `### Notes (${artNotes.length})\n\n`;

        artNotes.forEach((note, index) => {
          exportText += `#### Note ${index + 1}\n\n`;
          if (note.articleSection) {
            exportText += `**Section:** ${note.articleSection}\n\n`;
          }
          if (note.tags.length > 0) {
            exportText += `**Tags:** ${note.tags.join(', ')}\n\n`;
          }
          exportText += `${note.content}\n\n`;
          exportText += `*Created: ${new Date(note.createdAt).toLocaleString()}*\n`;
          exportText += `*Updated: ${new Date(note.updatedAt).toLocaleString()}*\n\n`;
          exportText += '---\n\n';
        });
      }

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="research-notes-${Date.now()}.txt"`
      );
      res.send(exportText);
    } catch (error) {
      next(error);
    }
  }
}
