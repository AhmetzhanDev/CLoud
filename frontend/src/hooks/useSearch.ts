import { useMutation } from '@tanstack/react-query';
import { searchApi, SearchResult } from '@/services/searchApi';

export const useSearch = () => {
  const arxivMutation = useMutation({
    mutationFn: searchApi.searchArxiv,
  });

  const semanticScholarMutation = useMutation({
    mutationFn: searchApi.searchSemanticScholar,
  });

  const importMutation = useMutation({
    mutationFn: searchApi.importArticle,
  });

  return {
    searchArxiv: arxivMutation.mutate,
    searchSemanticScholar: semanticScholarMutation.mutate,
    importArticle: (
      searchResult: SearchResult,
      options?: {
        onSuccess?: (data: any) => void;
        onError?: (error: any) => void;
        onSettled?: () => void;
      }
    ) => {
      importMutation.mutate(searchResult, options);
    },
    arxivResults: (arxivMutation.data && Array.isArray(arxivMutation.data)) ? arxivMutation.data : [],
    semanticScholarResults: (semanticScholarMutation.data && Array.isArray(semanticScholarMutation.data)) ? semanticScholarMutation.data : [],
    isSearching: arxivMutation.isPending || semanticScholarMutation.isPending,
    isImporting: importMutation.isPending,
  };
};
