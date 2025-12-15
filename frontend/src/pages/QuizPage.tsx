import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useQuiz } from '@/hooks/useQuiz';
import { useQuizStore } from '@/store/quizStore';
import { useArticle } from '@/hooks/useArticles';
import { articlesApi } from '@/services/articlesApi';
import QuizGenerator from '@/components/QuizGenerator';
import QuizInterface from '@/components/QuizInterface';
import MatchingPairsGame from '@/components/MatchingPairsGame';
import QuizResults from '@/components/QuizResults';
import type { Answer, QuizResult } from '@shared/types/quiz';

type QuizView = 'select-article' | 'generate' | 'taking' | 'results';
type TakingMode = 'quiz' | 'matching';

export default function QuizPage() {
  const navigate = useNavigate();
  const { id: articleIdFromParams } = useParams<{ id: string }>();
  const { submitQuiz, isSubmitting } = useQuiz();
  const { currentQuiz, clearCurrentQuiz } = useQuizStore();
  
  const [view, setView] = useState<QuizView>(
    articleIdFromParams ? 'generate' : 'select-article'
  );
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    articleIdFromParams || null
  );
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [takingMode, setTakingMode] = useState<TakingMode>('quiz');

  // Fetch articles for selection
  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.getAll(),
    enabled: view === 'select-article',
  });

  // Fetch selected article details
  const { data: selectedArticle } = useArticle(selectedArticleId || '');

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    setView('generate');
  };

  const handleQuizGenerated = () => {
    // The quiz is already in the store from the mutation
    // We just need to switch to the taking view
    setView('taking');
  };

  const handleSubmitQuiz = (answers: Answer[]) => {
    if (!currentQuiz) return;

    submitQuiz(
      {
        quizId: currentQuiz.id,
        userId: 'default-user', // TODO: Get from user context
        answers,
      },
      {
        onSuccess: (result: QuizResult) => {
          setQuizResult(result);
          setView('results');
        },
      }
    );
  };

  const handleRetakeQuiz = () => {
    clearCurrentQuiz();
    setQuizResult(null);
    setView('generate');
    setTakingMode('quiz');
  };

  const handleViewArticle = () => {
    if (selectedArticleId) {
      navigate(`/article/${selectedArticleId}`);
    }
  };

  const handleStartNew = () => {
    clearCurrentQuiz();
    setQuizResult(null);
    setSelectedArticleId(null);
    setView('select-article');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz</h1>
            {selectedArticle && (
              <p className="text-gray-600">
                Testing your understanding of:{' '}
                <span className="font-medium">{selectedArticle.title}</span>
              </p>
            )}

            {/* Кнопки режима сразу под заголовком */}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTakingMode('quiz')}
                className={`btn btn-sm ${
                  takingMode === 'quiz' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Обычный квиз
              </button>
              <button
                type="button"
                onClick={() => setTakingMode('matching')}
                className={`btn btn-sm ${
                  takingMode === 'matching' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Игра: найди пары
              </button>
            </div>
          </div>
          {view !== 'select-article' && (
            <button onClick={handleStartNew} className="btn btn-secondary">
              Start New Quiz
            </button>
          )}
        </div>
      </div>

      {/* Article Selection View */}
      {view === 'select-article' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select an Article to Quiz
          </h2>
          
          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleSelect(article.id)}
                  className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {article.authors.join(', ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {article.source}
                    </span>
                    {article.keywords.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {article.keywords.length} keywords
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Available</h3>
              <p className="text-gray-600 mb-6">
                Upload some articles first to start taking quizzes.
              </p>
              <button
                onClick={() => navigate('/library')}
                className="btn btn-primary"
              >
                Go to Library
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quiz Generation View */}
      {view === 'generate' && selectedArticleId && (
        <QuizGenerator
          articleId={selectedArticleId}
          onQuizGenerated={handleQuizGenerated}
        />
      )}

      {/* Quiz Taking View */}
      {view === 'taking' && currentQuiz && (
        <>
          {takingMode === 'quiz' && (
            <QuizInterface
              quiz={currentQuiz}
              onSubmit={handleSubmitQuiz}
              isSubmitting={isSubmitting}
            />
          )}

          {takingMode === 'matching' && (
            <MatchingPairsGame quiz={currentQuiz} />
          )}
        </>
      )}

      {/* Quiz Results View */}
      {view === 'results' && currentQuiz && quizResult && (
        <QuizResults
          quiz={currentQuiz}
          result={quizResult}
          onRetake={handleRetakeQuiz}
          onViewArticle={handleViewArticle}
        />
      )}
    </div>
  );
}
