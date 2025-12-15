import { getMongoDb } from '../config/mongo';
import { Quiz, QuizResult, CreateQuiz, QuizSchema, QuizResultSchema } from '../../../shared/src/types/quiz';
import { v4 as uuidv4 } from 'uuid';

export class QuizModel {
  static async create(data: CreateQuiz): Promise<Quiz> {
    const db = getMongoDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const quizData: Quiz = {
      id,
      ...data,
      createdAt: now,
    };

    await db.collection<Quiz>('quizzes').insertOne(quizData);

    return QuizSchema.parse(quizData);
  }

  static async findById(id: string): Promise<Quiz | null> {
    const db = getMongoDb();
    const doc = await db.collection<Quiz>('quizzes').findOne({ id });
    if (!doc) return null;
    return QuizSchema.parse(doc);
  }

  static async findByArticleId(articleId: string): Promise<Quiz[]> {
    const db = getMongoDb();
    const docs = await db
      .collection<Quiz>('quizzes')
      .find({ articleId })
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map(doc => QuizSchema.parse(doc));
  }

  static async delete(id: string): Promise<boolean> {
    const db = getMongoDb();
    const result = await db.collection<Quiz>('quizzes').deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export class QuizResultModel {
  static async create(data: {
    quizId: string;
    userId: string;
    answers: any[];
    score: number;
  }): Promise<QuizResult> {
    const db = getMongoDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const resultData: QuizResult = {
      id,
      ...data,
      completedAt: now,
    };

    await db.collection<QuizResult>('quiz_results').insertOne(resultData);

    return QuizResultSchema.parse(resultData);
  }

  static async findById(id: string): Promise<QuizResult | null> {
    const db = getMongoDb();
    const doc = await db.collection<QuizResult>('quiz_results').findOne({ id });
    if (!doc) return null;
    return QuizResultSchema.parse(doc);
  }

  static async findByUserId(
    userId: string,
    options?: { limit?: number },
  ): Promise<QuizResult[]> {
    const db = getMongoDb();
    let cursor = db
      .collection<QuizResult>('quiz_results')
      .find({ userId })
      .sort({ completedAt: -1 });

    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    const docs = await cursor.toArray();
    return docs.map(doc => QuizResultSchema.parse(doc));
  }

  static async findByQuizId(quizId: string): Promise<QuizResult[]> {
    const db = getMongoDb();
    const docs = await db
      .collection<QuizResult>('quiz_results')
      .find({ quizId })
      .sort({ completedAt: -1 })
      .toArray();

    return docs.map(doc => QuizResultSchema.parse(doc));
  }
}
