import api from './api';
import type { Article } from '@shared/types/article';

export const articlesApi = {
  // Get all articles
  getAll: async (): Promise<Article[]> => {
    const response = await api.get('/articles');
    return response.data.articles || [];
  },

  // Get article by ID
  getById: async (id: string): Promise<Article> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  // Upload PDF file
  uploadPDF: async (file: File): Promise<Article> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/articles/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload by URL
  uploadByURL: async (url: string): Promise<Article> => {
    const response = await api.post('/articles/url', { url });
    return response.data;
  },

  // Delete article
  delete: async (id: string): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },

  // Get article content
  getContent: async (id: string): Promise<{ content: string }> => {
    const response = await api.get(`/articles/${id}/content`);
    return response.data;
  },
};
