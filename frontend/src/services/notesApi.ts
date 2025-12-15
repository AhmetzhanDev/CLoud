import api from './api';
import type { Note, CreateNote, UpdateNote } from '@shared/types/note';
import { queueRequestIfOffline } from '@/utils/syncQueue';

export const notesApi = {
  // Get all notes
  getAll: async (userId: string): Promise<Note[]> => {
    const response = await api.get('/notes', { params: { userId } });
    return response.data;
  },

  // Get note by ID
  getById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Get notes by article
  getByArticleId: async (articleId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/article/${articleId}`);
    return response.data;
  },

  // Create note
  create: async (note: CreateNote): Promise<Note> => {
    // Queue request if offline
    if (queueRequestIfOffline('/notes', 'POST', note)) {
      throw new Error('Заметка будет создана при восстановлении подключения');
    }
    
    const response = await api.post('/notes', note);
    return response.data;
  },

  // Update note
  update: async (id: string, updates: UpdateNote): Promise<Note> => {
    // Queue request if offline
    if (queueRequestIfOffline(`/notes/${id}`, 'PUT', updates)) {
      throw new Error('Изменения будут сохранены при восстановлении подключения');
    }
    
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },

  // Delete note
  delete: async (id: string): Promise<void> => {
    // Queue request if offline
    if (queueRequestIfOffline(`/notes/${id}`, 'DELETE')) {
      throw new Error('Заметка будет удалена при восстановлении подключения');
    }
    
    await api.delete(`/notes/${id}`);
  },

  // Search notes
  search: async (userId: string, query: string): Promise<Note[]> => {
    const response = await api.get('/notes', {
      params: { userId, search: query },
    });
    return response.data;
  },

  // Export notes
  exportNotes: async (userId: string): Promise<Blob> => {
    const response = await api.get('/notes/export', {
      params: { userId },
      responseType: 'blob',
    });
    return response.data;
  },
};
