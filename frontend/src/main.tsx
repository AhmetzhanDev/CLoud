import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
// import { registerServiceWorker } from './utils/serviceWorker';
// import { syncQueue } from './utils/syncQueue';
import { reportWebVitals } from './utils/performance';
import { useQuizStore } from './store/quizStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Validate and clean up any corrupted quiz data on startup
try {
  const { validateAndCleanQuizzes } = useQuizStore.getState();
  validateAndCleanQuizzes();
} catch (error) {
  console.error('Failed to validate quizzes:', error);
}

// Register Service Worker for offline functionality
// Temporarily disabled for debugging
// registerServiceWorker({
//   onSuccess: () => {
//     console.log('Content cached for offline use');
//   },
//   onUpdate: () => {
//     console.log('New content available, please refresh');
//   },
//   onOnline: () => {
//     console.log('Connection restored, processing sync queue');
//     syncQueue.processQueue();
//   },
// });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Report web vitals in development
if (import.meta.env.DEV) {
  reportWebVitals((metric) => {
    console.log('[Web Vitals]', metric);
  });
}
