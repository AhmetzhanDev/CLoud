import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quiz, QuizResult, Answer } from '@shared/types/quiz';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentAnswers: Answer[];
  results: QuizResult[];
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCurrentAnswers: (answers: Answer[]) => void;
  addAnswer: (answer: Answer) => void;
  addResult: (result: QuizResult) => void;
  clearCurrentQuiz: () => void;
  validateAndCleanQuizzes: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      quizzes: [],
      currentQuiz: null,
      currentAnswers: [],
      results: [],

      setQuizzes: (quizzes) => set({ quizzes }),

      addQuiz: (quiz) =>
        set((state) => ({
          quizzes: [quiz, ...state.quizzes],
        })),

      setCurrentQuiz: (quiz) =>
        set({
          currentQuiz: quiz,
          currentAnswers: [],
        }),

      setCurrentAnswers: (answers) => set({ currentAnswers: answers }),

      addAnswer: (answer) =>
        set((state) => {
          const existingIndex = state.currentAnswers.findIndex(
            (a) => a.questionId === answer.questionId
          );
          if (existingIndex >= 0) {
            const newAnswers = [...state.currentAnswers];
            newAnswers[existingIndex] = answer;
            return { currentAnswers: newAnswers };
          }
          return {
            currentAnswers: [...state.currentAnswers, answer],
          };
        }),

      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results],
        })),

      clearCurrentQuiz: () =>
        set({
          currentQuiz: null,
          currentAnswers: [],
        }),

      validateAndCleanQuizzes: () =>
        set((state) => {
          // Remove quizzes with invalid IDs (not 36 characters)
          const validQuizzes = state.quizzes.filter((quiz) => {
            const isValid = quiz.id && quiz.id.length === 36;
            if (!isValid) {
              console.warn('Removing invalid quiz:', quiz.id);
            }
            return isValid;
          });

          // Clear current quiz if it's invalid
          const currentQuizValid = state.currentQuiz && state.currentQuiz.id.length === 36;

          return {
            quizzes: validQuizzes,
            currentQuiz: currentQuizValid ? state.currentQuiz : null,
            currentAnswers: currentQuizValid ? state.currentAnswers : [],
          };
        }),
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        quizzes: state.quizzes,
        results: state.results,
      }),
    }
  )
);
