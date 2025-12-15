import api from './api';
import type { Summary } from '@shared/types/summary';
import type { ResearchDirection } from '@shared/types/researchDirection';

export const analysisApi = {
  // Generate summary for article
  generateSummary: async (articleId: string): Promise<Summary> => {
    const response = await api.post('/analysis/summarize', { articleId });
    return response.data;
  },

  // Get saved analysis
  getAnalysis: async (articleId: string): Promise<Summary> => {
    const response = await api.get(`/analysis/${articleId}`);
    return response.data;
  },

  // Export summary
  exportSummary: async (articleId: string): Promise<Blob> => {
    const response = await api.get(`/analysis/${articleId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate research directions
  generateDirections: async (articleIds: string[]): Promise<ResearchDirection[]> => {
    const response = await api.post('/analysis/directions', { articleIds });
    return response.data;
  },

  // Get direction details
  getDirection: async (id: string): Promise<ResearchDirection> => {
    const response = await api.get(`/directions/${id}`);
    return response.data;
  },

  // Save selected direction
  saveDirection: async (id: string): Promise<void> => {
    await api.post(`/directions/${id}/save`);
  },
};
