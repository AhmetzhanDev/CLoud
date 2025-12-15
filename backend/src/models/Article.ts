import { getMongoDb } from '../config/mongo';
import { Article, CreateArticle, ArticleSchema } from '../../../shared/src/types/article';
import { v4 as uuidv4 } from 'uuid';

export class ArticleModel {
  static async create(data: CreateArticle): Promise<Article> {
    const db = getMongoDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const articleData: Article = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<Article>('articles').insertOne(articleData);

    return ArticleSchema.parse(articleData);
  }

  static async findById(id: string): Promise<Article | null> {
    const db = getMongoDb();
    const doc = await db.collection<Article>('articles').findOne({ id });
    if (!doc) return null;
    return ArticleSchema.parse(doc);
  }

  static async findAll(options?: {
    limit?: number;
    offset?: number;
    source?: Article['source'];
  }): Promise<Article[]> {
    const db = getMongoDb();
    const collection = db.collection<Article>('articles');

    const filter: Partial<Article> = {};
    if (options?.source) {
      filter.source = options.source;
    }

    let cursor = collection.find(filter).sort({ createdAt: -1 });

    if (options?.offset) {
      cursor = cursor.skip(options.offset);
    }
    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    const docs = await cursor.toArray();
    return docs.map(doc => ArticleSchema.parse(doc));
  }

  static async update(id: string, data: Partial<CreateArticle>): Promise<Article | null> {
    const db = getMongoDb();
    const now = new Date().toISOString();

    const update: Partial<Article> = {
      ...data,
      updatedAt: now,
    };

    await db.collection<Article>('articles').updateOne(
      { id },
      { $set: update },
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = getMongoDb();
    const result = await db.collection<Article>('articles').deleteOne({ id });
    return result.deletedCount === 1;
  }

  static async count(source?: Article['source']): Promise<number> {
    const db = getMongoDb();
    const filter: Partial<Article> = {};
    if (source) {
      filter.source = source;
    }
    return db.collection<Article>('articles').countDocuments(filter as any);
  }

  static async findBySourceId(
    sourceId: string,
    source: Article['source'],
  ): Promise<Article | null> {
    const db = getMongoDb();
    const doc = await db
      .collection<Article>('articles')
      .findOne({ sourceId, source });
    if (!doc) return null;
    return ArticleSchema.parse(doc);
  }
}
