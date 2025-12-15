import axios, { AxiosError } from 'axios';
import { showErrorToast } from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred';

    // Check if offline
    if (!navigator.onLine) {
      errorMessage = 'Вы не в сети. Эта функция требует подключения к интернету.';
      showErrorToast(errorMessage);
      throw new Error(errorMessage);
    }

    if (error.response) {
      // Server responded with error status
      const message = (error.response.data as any)?.message || 'An error occurred';
      console.error('API Error:', message);
      
      switch (error.response.status) {
        case 400:
          errorMessage = `Неверный запрос: ${message}`;
          break;
        case 401:
          errorMessage = 'Требуется авторизация';
          break;
        case 404:
          errorMessage = 'Ресурс не найден';
          break;
        case 422:
          errorMessage = `Ошибка валидации: ${message}`;
          break;
        case 500:
          errorMessage = 'Ошибка сервера. Попробуйте позже.';
          break;
        case 503:
          // Service Worker returned offline response
          const data = error.response.data as any;
          if (data?.offline) {
            errorMessage = 'Нет подключения к интернету. Данные недоступны в кэше.';
          } else {
            errorMessage = 'Сервис временно недоступен';
          }
          break;
        default:
          errorMessage = message;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
    } else {
      // Something else happened
      errorMessage = error.message || 'An unexpected error occurred';
    }

    showErrorToast(errorMessage);
    throw new Error(errorMessage);
  }
);

export default api;
