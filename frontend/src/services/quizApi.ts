import api from './api';
import type { Quiz, QuizResult, Answer } from '@shared/types/quiz';

interface GenerateQuizRequest {
  articleId: string;
  questionCount?: number;
  questionTypes?: string[];
}

interface SubmitQuizRequest {
  quizId: string;
  userId: string;
  answers: Answer[];
}

export const quizApi = {
  // Generate quiz for article
  generate: async (request: GenerateQuizRequest): Promise<Quiz> => {
    const response = await api.post('/quiz/generate', request);
    return response.data;
  },

  // Submit quiz answers
  submit: async (request: SubmitQuizRequest): Promise<QuizResult> => {
    console.log('Submitting quiz:', {
      quizId: request.quizId,
      quizIdLength: request.quizId?.length,
      userId: request.userId,
      answersCount: request.answers?.length
    });
    
    // Validate quiz ID format (should be a valid UUID)
    if (!request.quizId || request.quizId.length !== 36) {
      console.error('Invalid quiz ID format:', request.quizId);
      throw new Error(`Invalid quiz ID format. Expected 36 characters, got ${request.quizId?.length}. Please regenerate the quiz.`);
    }
    
    const response = await api.post('/quiz/submit', request);
    return response.data;
  },

  // Get quizzes for article
  getByArticleId: async (articleId: string): Promise<Quiz[]> => {
    const response = await api.get(`/quiz/${articleId}`);
    return response.data;
  },

  // Get user results
  getUserResults: async (userId: string): Promise<QuizResult[]> => {
    const response = await api.get(`/quiz/results/${userId}`);
    return response.data;
  },

  // Get quiz explanations
  getExplanations: async (quizId: string): Promise<any> => {
    const response = await api.get(`/quiz/${quizId}/explanations`);
    return response.data;
  },
};
