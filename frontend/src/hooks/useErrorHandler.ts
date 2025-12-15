import { useCallback } from 'react';
import { showErrorToast } from '../utils/toast';

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error occurred:', error);

    let errorMessage = customMessage || 'Произошла ошибка';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    showErrorToast(errorMessage);
  }, []);

  return { handleError };
};
