import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '@/services/quizApi';
import { useQuizStore } from '@/store/quizStore';

export const useQuiz = () => {
  const queryClient = useQueryClient();
  const { addQuiz, setCurrentQuiz, addResult } = useQuizStore();

  const generateMutation = useMutation({
    mutationFn: quizApi.generate,
    onSuccess: (quiz: any) => {
      addQuiz(quiz);
      setCurrentQuiz(quiz);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: quizApi.submit,
    onSuccess: (result: any) => {
      addResult(result);
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
    },
  });

  return {
    generateQuiz: generateMutation.mutate,
    submitQuiz: submitMutation.mutate,
    isGenerating: generateMutation.isPending,
    isSubmitting: submitMutation.isPending,
  };
};

export const useQuizResults = (userId: string) => {
  return useQuery({
    queryKey: ['quiz-results', userId],
    queryFn: () => quizApi.getUserResults(userId),
    enabled: !!userId,
  });
};
