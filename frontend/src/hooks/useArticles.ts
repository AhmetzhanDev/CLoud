import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '@/services/articlesApi';
import { useArticlesStore } from '@/store/articlesStore';
import type { Article } from '@shared/types/article';

export const useArticles = () => {
  const queryClient = useQueryClient();
  const { setArticles, addArticle, deleteArticle: removeFromStore } = useArticlesStore();

  const articlesQuery = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const articles = await articlesApi.getAll();
      setArticles(articles);
      return articles;
    },
  });

  const uploadPDFMutation = useMutation({
    mutationFn: articlesApi.uploadPDF,
    onSuccess: (article: Article) => {
      addArticle(article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const uploadByURLMutation = useMutation({
    mutationFn: articlesApi.uploadByURL,
    onSuccess: (article: Article) => {
      addArticle(article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: (_: void, id: string) => {
      removeFromStore(id);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  return {
    articles: articlesQuery.data,
    isLoading: articlesQuery.isLoading,
    error: articlesQuery.error,
    uploadPDF: uploadPDFMutation.mutate,
    uploadByURL: uploadByURLMutation.mutate,
    deleteArticle: deleteMutation.mutate,
    isUploading: uploadPDFMutation.isPending || uploadByURLMutation.isPending,
  };
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesApi.getById(id),
    enabled: !!id,
  });
};
