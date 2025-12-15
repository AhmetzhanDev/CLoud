import { Request, Response, NextFunction } from 'express';
import { QuizModel } from '../models/Quiz';
import { ArticleModel } from '../models/Article';
import { aiService } from '../services/AIService';
import { v4 as uuidv4 } from 'uuid';
import { Question } from '../../../shared/src/types/quiz';
import { queryAll } from '../utils/db';

export class QuizController {
  /**
   * Generate quiz questions for an article
   * POST /api/quiz/generate
   */
  static async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { articleId, questionCount = 5 } = req.body;

      if (!articleId) {
        res.status(400).json({ error: 'Article ID is required' });
        return;
      }

      // Validate question count
      const count = Math.min(Math.max(questionCount, 5), 10);

      // Fetch the article
      const article = await ArticleModel.findById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Check if quiz already exists for this article
      const existingQuizzes = await QuizModel.findByArticleId(articleId);
      if (existingQuizzes.length > 0) {
        // Return the most recent quiz
        res.json(existingQuizzes[0]);
        return;
      }

      // Prepare the prompt for AI
      const systemPrompt = `You are an expert educational content creator specializing in generating quiz questions from academic articles. 
Your task is to create thoughtful, challenging questions that test deep understanding of the material.`;

      const userPrompt = `Based on the following scientific article, generate ${count} quiz questions.

Article Title: ${article.title}
Article Abstract: ${article.abstract}
Article Content: ${article.content.substring(0, 4000)}

Generate questions of the following types:
- multiple-choice: Questions with 4 options where only one is correct
- true-false: Binary questions
- open-ended: Questions requiring detailed written answers

For each question, provide:
1. The question text
2. For multiple-choice: 4 options (labeled A, B, C, D)
3. The correct answer
4. A detailed explanation
5. The section of the article the question relates to (if identifiable)

Return the response as a JSON array with this exact structure:
[
  {
    "type": "multiple-choice",
    "question": "What is the main objective of this research?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Detailed explanation of why this is correct...",
    "articleSection": "Introduction"
  },
  {
    "type": "true-false",
    "question": "The study used quantitative methods.",
    "correctAnswer": "true",
    "explanation": "The methodology section describes...",
    "articleSection": "Methodology"
  },
  {
    "type": "open-ended",
    "question": "Explain the significance of the main findings.",
    "correctAnswer": "The findings demonstrate that...",
    "explanation": "A comprehensive answer should include...",
    "articleSection": "Results"
  }
]

Generate exactly ${count} questions with a mix of types. Ensure questions test understanding, not just memorization.`;

      // Generate questions using AI
      const aiResponse = await aiService.generateCompletion(
        userPrompt,
        systemPrompt,
        {
          temperature: 0.7,
          maxTokens: 3000,
        }
      );

      // Parse AI response
      const questions = QuizController.parseAIResponse(aiResponse.content);

      if (questions.length === 0) {
        res.status(500).json({ error: 'Failed to generate questions' });
        return;
      }

      // Create quiz in database
      const quiz = await QuizModel.create({
        articleId,
        questions,
      });

      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit quiz answers and get results
   * POST /api/quiz/submit
   */
  static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, userId, answers } = req.body;

      console.log('Received quiz submission:', {
        quizId,
        quizIdLength: quizId?.length,
        quizIdType: typeof quizId,
        quizIdHex: Buffer.from(quizId || '', 'utf8').toString('hex'),
        userId,
        answersCount: answers?.length
      });

      if (!quizId || !userId || !answers) {
        res.status(400).json({ error: 'Quiz ID, user ID, and answers are required' });
        return;
      }

      // Fetch the quiz
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        console.error('Quiz not found with ID:', quizId, 'Length:', quizId.length);
        // List all available quiz IDs for debugging
        const { getDatabase } = await import('../config/database');
        const db = getDatabase();
        const allQuizzes = queryAll(db, 'SELECT id FROM quizzes');
        console.error('Available quiz IDs:', allQuizzes.map(q => ({ id: q.id, length: q.id.length })));
        res.status(404).json({ error: 'Quiz not found', receivedId: quizId, receivedLength: quizId.length });
        return;
      }

      // Validate and check answers
      const checkedAnswers = QuizController.checkAnswers(quiz.questions, answers);

      // Calculate score
      const correctCount = checkedAnswers.filter(a => a.isCorrect).length;
      const score = (correctCount / quiz.questions.length) * 100;

      // Save result to database
      const result = await QuizController.saveQuizResult({
        quizId,
        userId,
        answers: checkedAnswers,
        score,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz results for a user
   * GET /api/quiz/results/:userId
   */
  static async getResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const { QuizResultModel } = await import('../models/Quiz');
      const results = await QuizResultModel.findByUserId(
        userId,
        limit ? { limit: parseInt(limit as string) } : undefined
      );

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get quiz with explanations
   * GET /api/quiz/:quizId/explanations
   */
  static async getExplanations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params;

      if (!quizId) {
        res.status(400).json({ error: 'Quiz ID is required' });
        return;
      }

      // Fetch the quiz
      const quiz = await QuizModel.findById(quizId);
      if (!quiz) {
        res.status(404).json({ error: 'Quiz not found' });
        return;
      }

      // Fetch the article to provide context
      const article = await ArticleModel.findById(quiz.articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Format explanations with article context
      const explanations = quiz.questions.map(question => ({
        questionId: question.id,
        question: question.question,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        articleSection: question.articleSection,
        articleContext: QuizController.extractArticleContext(
          article.content,
          question.articleSection
        ),
      }));

      res.json({
        quizId: quiz.id,
        articleId: quiz.articleId,
        articleTitle: article.title,
        explanations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Extract relevant context from article based on section
   */
  private static extractArticleContext(
    content: string,
    section?: string
  ): string | undefined {
    if (!section) {
      return undefined;
    }

    // Try to find the section in the content
    const sectionRegex = new RegExp(
      `(${section}[:\\s]+)([\\s\\S]{0,500})`,
      'i'
    );
    const match = content.match(sectionRegex);

    if (match && match[2]) {
      // Return first 500 characters of the section
      return match[2].trim().substring(0, 500) + '...';
    }

    return undefined;
  }

  /**
   * Check user answers against correct answers
   */
  private static checkAnswers(
    questions: Question[],
    userAnswers: Array<{ questionId: string; userAnswer: string | string[] }>
  ) {
    return userAnswers.map(userAnswer => {
      const question = questions.find(q => q.id === userAnswer.questionId);
      
      if (!question) {
        return {
          questionId: userAnswer.questionId,
          userAnswer: userAnswer.userAnswer,
          isCorrect: false,
        };
      }

      const isCorrect = QuizController.compareAnswers(
        question.correctAnswer,
        userAnswer.userAnswer
      );

      return {
        questionId: userAnswer.questionId,
        userAnswer: userAnswer.userAnswer,
        isCorrect,
      };
    });
  }

  /**
   * Compare user answer with correct answer
   */
  private static compareAnswers(
    correctAnswer: string | string[],
    userAnswer: string | string[]
  ): boolean {
    // Normalize to arrays for comparison
    const correctArray = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

    // For multiple answers, check if all correct answers are present
    if (correctArray.length > 1) {
      return correctArray.every(ca => 
        userArray.some(ua => 
          ua.toLowerCase().trim() === ca.toLowerCase().trim()
        )
      ) && correctArray.length === userArray.length;
    }

    // For single answer, do case-insensitive comparison
    return userArray.some(ua => 
      ua.toLowerCase().trim() === correctArray[0].toLowerCase().trim()
    );
  }

  /**
   * Save quiz result to database
   */
  private static async saveQuizResult(data: {
    quizId: string;
    userId: string;
    answers: any[];
    score: number;
  }) {
    return await QuizController.createQuizResult(data);
  }

  /**
   * Create quiz result (wrapper for model method)
   */
  private static async createQuizResult(data: {
    quizId: string;
    userId: string;
    answers: any[];
    score: number;
  }) {
      const { QuizResultModel } = await import('../models/Quiz');
      return QuizResultModel.create(data);
  }

  /**
   * Parse AI response and convert to Question array
   */
  private static parseAIResponse(content: string): Question[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and transform to Question format
      const questions: Question[] = parsed.map((q: any) => {
        const question: Question = {
          id: uuidv4(),
          type: q.type,
          question: q.question,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        };

        if (q.options && Array.isArray(q.options)) {
          question.options = q.options;
        }

        if (q.articleSection) {
          question.articleSection = q.articleSection;
        }

        return question;
      });

      return questions;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response content:', content);
      return [];
    }
  }
}
