import { getDatabase } from '../config/database';
import { Summary, CreateSummary, SummarySchema } from '../../../shared/src/types/summary';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute, parseJsonFields, stringifyJsonFields } from '../utils/db';

export class SummaryModel {
  static create(data: CreateSummary): Summary {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const summaryData = stringifyJsonFields(
      {
        id,
        ...data,
        createdAt: now,
      },
      ['keyFindings']
    );

    execute(
      db,
      `INSERT INTO summaries (
        id, article_id, objective, methodology, results, conclusions, key_findings, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        summaryData.id,
        summaryData.articleId,
        summaryData.objective,
        summaryData.methodology,
        summaryData.results,
        summaryData.conclusions,
        summaryData.keyFindings,
        summaryData.createdAt,
      ]
    );

    const summary = this.findById(id);
    if (!summary) {
      throw new Error('Failed to create summary');
    }

    return SummarySchema.parse(summary);
  }

  static findById(id: string): Summary | null {
    const db = getDatabase();
    const row = queryOne(db, 'SELECT * FROM summaries WHERE id = ?', [id]);

    if (!row) return null;

    const parsed = parseJsonFields(row, ['key_findings']);
    return SummarySchema.parse({
      ...parsed,
      articleId: parsed.article_id,
      keyFindings: parsed.key_findings,
      createdAt: parsed.created_at,
    });
  }

  static findByArticleId(articleId: string): Summary | null {
    const db = getDatabase();
    const row = queryOne(
      db,
      'SELECT * FROM summaries WHERE article_id = ? ORDER BY created_at DESC LIMIT 1',
      [articleId]
    );

    if (!row) return null;

    const parsed = parseJsonFields(row, ['key_findings']);
    return SummarySchema.parse({
      ...parsed,
      articleId: parsed.article_id,
      keyFindings: parsed.key_findings,
      createdAt: parsed.created_at,
    });
  }

  static findAll(options?: { limit?: number; offset?: number }): Summary[] {
    const db = getDatabase();
    let sql = 'SELECT * FROM summaries ORDER BY created_at DESC';
    const params: any[] = [];

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
      const parsed = parseJsonFields(row, ['key_findings']);
      return SummarySchema.parse({
        ...parsed,
        articleId: parsed.article_id,
        keyFindings: parsed.key_findings,
        createdAt: parsed.created_at,
      });
    });
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = execute(db, 'DELETE FROM summaries WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
