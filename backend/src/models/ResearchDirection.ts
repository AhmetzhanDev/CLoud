import { getDatabase } from '../config/database';
import { ResearchDirection, CreateResearchDirection, ResearchDirectionSchema } from '../../../shared/src/types/researchDirection';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute, parseJsonFields, stringifyJsonFields } from '../utils/db';

export class ResearchDirectionModel {
  static create(data: CreateResearchDirection): ResearchDirection {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const directionData = stringifyJsonFields(
      {
        id,
        ...data,
        createdAt: now,
      },
      ['articleIds', 'researchQuestions', 'methodology', 'risks', 'limitations', 'futureWork', 'keyReferences']
    );

    execute(
      db,
      `INSERT INTO research_directions (
        id, article_ids, title, description, research_questions,
        methodology, pipeline, relevance_score, novelty_score, rationale,
        risks, limitations, future_work, key_references, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        directionData.id,
        directionData.articleIds,
        directionData.title,
        directionData.description,
        directionData.researchQuestions,
        directionData.methodology || null,
        directionData.pipeline || null,
        directionData.relevanceScore,
        directionData.noveltyScore,
        directionData.rationale,
        directionData.risks || null,
        directionData.limitations || null,
        directionData.futureWork || null,
        directionData.keyReferences || null,
        directionData.createdAt,
      ]
    );

    const direction = this.findById(id);
    if (!direction) {
      throw new Error('Failed to create research direction');
    }

    return ResearchDirectionSchema.parse(direction);
  }

  static findById(id: string): ResearchDirection | null {
    const db = getDatabase();
    const row = queryOne(db, 'SELECT * FROM research_directions WHERE id = ?', [id]);

    if (!row) return null;

    const parsed = parseJsonFields(row, [
      'article_ids',
      'research_questions',
      'methodology',
      'risks',
      'limitations',
      'future_work',
      'key_references'
    ]);
    
    return ResearchDirectionSchema.parse({
      ...parsed,
      articleIds: parsed.article_ids,
      researchQuestions: parsed.research_questions,
      methodology: parsed.methodology,
      pipeline: parsed.pipeline,
      relevanceScore: parsed.relevance_score,
      noveltyScore: parsed.novelty_score,
      risks: parsed.risks,
      limitations: parsed.limitations,
      futureWork: parsed.future_work,
      keyReferences: parsed.key_references,
      createdAt: parsed.created_at,
    });
  }

  static findAll(options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'novelty' | 'created';
  }): ResearchDirection[] {
    const db = getDatabase();
    let sql = 'SELECT * FROM research_directions';
    const params: any[] = [];

    // Sorting
    if (options?.sortBy === 'relevance') {
      sql += ' ORDER BY relevance_score DESC';
    } else if (options?.sortBy === 'novelty') {
      sql += ' ORDER BY novelty_score DESC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

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
      const parsed = parseJsonFields(row, [
        'article_ids',
        'research_questions',
        'methodology',
        'risks',
        'limitations',
        'future_work',
        'key_references'
      ]);
      return ResearchDirectionSchema.parse({
        ...parsed,
        articleIds: parsed.article_ids,
        researchQuestions: parsed.research_questions,
        methodology: parsed.methodology,
        pipeline: parsed.pipeline,
        relevanceScore: parsed.relevance_score,
        noveltyScore: parsed.novelty_score,
        risks: parsed.risks,
        limitations: parsed.limitations,
        futureWork: parsed.future_work,
        keyReferences: parsed.key_references,
        createdAt: parsed.created_at,
      });
    });
  }

  static findByArticleId(articleId: string): ResearchDirection[] {
    const db = getDatabase();
    const rows = queryAll(
      db,
      `SELECT * FROM research_directions 
       WHERE article_ids LIKE ?
       ORDER BY relevance_score DESC`,
      [`%"${articleId}"%`]
    );

    return rows.map(row => {
      const parsed = parseJsonFields(row, [
        'article_ids',
        'research_questions',
        'methodology',
        'risks',
        'limitations',
        'future_work',
        'key_references'
      ]);
      return ResearchDirectionSchema.parse({
        ...parsed,
        articleIds: parsed.article_ids,
        researchQuestions: parsed.research_questions,
        methodology: parsed.methodology,
        pipeline: parsed.pipeline,
        relevanceScore: parsed.relevance_score,
        noveltyScore: parsed.novelty_score,
        risks: parsed.risks,
        limitations: parsed.limitations,
        futureWork: parsed.future_work,
        keyReferences: parsed.key_references,
        createdAt: parsed.created_at,
      });
    });
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = execute(db, 'DELETE FROM research_directions WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
