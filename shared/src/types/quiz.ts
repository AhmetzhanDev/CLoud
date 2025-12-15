import { z } from 'zod';

export const QuestionTypeSchema = z.enum(['multiple-choice', 'true-false', 'open-ended']);

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string(),
  articleSection: z.string().optional(),
});

export const QuizSchema = z.object({
  id: z.string(),
  articleId: z.string(),
  questions: z.array(QuestionSchema),
  createdAt: z.string(),
});

export const AnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean(),
});

export const QuizResultSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string(),
  answers: z.array(AnswerSchema),
  score: z.number(),
  completedAt: z.string(),
});

export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;

export const CreateQuizSchema = QuizSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateQuiz = z.infer<typeof CreateQuizSchema>;
