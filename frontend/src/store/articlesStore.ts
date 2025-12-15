import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article } from '@shared/types/article';

interface ArticlesState {
  articles: Article[];
  selectedArticle: Article | null;
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  selectArticle: (article: Article | null) => void;
  getArticleById: (id: string) => Article | undefined;
}

export const useArticlesStore = create<ArticlesState>()(
  persist(
    (set, get) => ({
      articles: [],
      selectedArticle: null,

      setArticles: (articles) => set({ articles }),

      addArticle: (article) =>
        set((state) => ({
          articles: [article, ...state.articles],
        })),

      updateArticle: (id, updatedArticle) =>
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id ? { ...article, ...updatedArticle } : article
          ),
        })),

      deleteArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((article) => article.id !== id),
          selectedArticle:
            state.selectedArticle?.id === id ? null : state.selectedArticle,
        })),

      selectArticle: (article) => set({ selectedArticle: article }),

      getArticleById: (id) => get().articles.find((article) => article.id === id),
    }),
    {
      name: 'articles-storage',
      partialize: (state) => ({
        articles: state.articles,
      }),
    }
  )
);
