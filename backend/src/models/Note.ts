import { getDatabase } from '../config/database';
import { Note, CreateNote, UpdateNote, NoteSchema } from '../../../shared/src/types/note';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute, parseJsonFields, stringifyJsonFields } from '../utils/db';

export class NoteModel {
  static create(data: CreateNote): Note {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const noteData = stringifyJsonFields(
      {
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      },
      ['tags']
    );

    execute(
      db,
      `INSERT INTO notes (id, user_id, article_id, content, article_section, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noteData.id,
        noteData.userId,
        noteData.articleId,
        noteData.content,
        noteData.articleSection || null,
        noteData.tags,
        noteData.createdAt,
        noteData.updatedAt,
      ]
    );

    const note = this.findById(id);
    if (!note) {
      throw new Error('Failed to create note');
    }

    return NoteSchema.parse(note);
  }

  static findById(id: string): Note | null {
    const db = getDatabase();
    const row = queryOne(db, 'SELECT * FROM notes WHERE id = ?', [id]);

    if (!row) return null;

    const parsed = parseJsonFields(row, ['tags']);
    return NoteSchema.parse({
      ...parsed,
      userId: parsed.user_id,
      articleId: parsed.article_id,
      articleSection: parsed.article_section,
      createdAt: parsed.created_at,
      updatedAt: parsed.updated_at,
    });
  }

  static findByUserId(userId: string, options?: { limit?: number; offset?: number }): Note[] {
    const db = getDatabase();
    let sql = 'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC';
    const params: any[] = [userId];

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = queryAll(db, sql, params);
    return rows.map(row => {
      const parsed = parseJsonFields(row, ['tags']);
      return NoteSchema.parse({
        ...parsed,
        userId: parsed.user_id,
        articleId: parsed.article_id,
        articleSection: parsed.article_section,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
      });
    });
  }

  static findByArticleId(articleId: string, userId?: string): Note[] {
    const db = getDatabase();
    let sql = 'SELECT * FROM notes WHERE article_id = ?';
    const params: any[] = [articleId];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = queryAll(db, sql, params);
    return rows.map(row => {
      const parsed = parseJsonFields(row, ['tags']);
      return NoteSchema.parse({
        ...parsed,
        userId: parsed.user_id,
        articleId: parsed.article_id,
        articleSection: parsed.article_section,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
      });
    });
  }

  static update(id: string, data: UpdateNote): Note | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    const updates: string[] = [];
    const params: any[] = [];

    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }
    if (data.articleSection !== undefined) {
      updates.push('article_section = ?');
      params.push(data.articleSection);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(data.tags));
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    execute(db, `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = execute(db, 'DELETE FROM notes WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static search(query: string, userId?: string): Note[] {
    const db = getDatabase();
    let sql = `
      SELECT n.* FROM notes n
      JOIN notes_fts fts ON n.id = fts.note_id
      WHERE notes_fts MATCH ?
    `;
    const params: any[] = [query];

    if (userId) {
      sql += ' AND n.user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY n.updated_at DESC';

    const rows = queryAll(db, sql, params);
    return rows.map(row => {
      const parsed = parseJsonFields(row, ['tags']);
      return NoteSchema.parse({
        ...parsed,
        userId: parsed.user_id,
        articleId: parsed.article_id,
        articleSection: parsed.article_section,
        createdAt: parsed.created_at,
        updatedAt: parsed.updated_at,
      });
    });
  }

  static countByUserId(userId: string): number {
    const db = getDatabase();
    const result = queryOne<{ count: number }>(
      db,
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }
}
