import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SyncStatus } from './components/SyncStatus';

// Lazy load pages for code splitting
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ArticleViewPage = lazy(() => import('./pages/ArticleViewPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const DirectionsPage = lazy(() => import('./pages/DirectionsPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600">Загрузка...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
        <ConnectionStatus />
        <SyncStatus />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/library" replace />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="article/:id" element={<ArticleViewPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="directions" element={<DirectionsPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="notes" element={<NotesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
