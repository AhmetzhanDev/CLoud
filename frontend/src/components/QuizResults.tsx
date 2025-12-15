import type { Quiz, QuizResult, Answer } from '@shared/types/quiz';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onRetake?: () => void;
  onViewArticle?: () => void;
}

export default function QuizResults({ quiz, result, onRetake, onViewArticle }: QuizResultsProps) {
  const percentage = Math.round(result.score * 100);
  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const totalCount = result.answers.length;

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-50 border-green-200';
    if (score >= 0.6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 0.9) return 'Excellent! You have a strong understanding of this article.';
    if (score >= 0.8) return 'Great job! You understood most of the key concepts.';
    if (score >= 0.7) return 'Good work! You grasped many important points.';
    if (score >= 0.6) return 'Not bad! Consider reviewing the article for better understanding.';
    return 'Keep learning! Review the article and try again.';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionById = (questionId: string) => {
    return quiz.questions.find((q) => q.id === questionId);
  };

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className={`card border-2 ${getScoreBgColor(result.score)}`}>
        <div className="text-center">
          <div className="mb-4">
            <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
              {percentage}%
            </div>
            <p className="text-lg text-gray-700 mt-2">
              {correctCount} out of {totalCount} correct
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  result.score >= 0.8
                    ? 'bg-green-600'
                    : result.score >= 0.6
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <p className={`text-lg font-medium ${getScoreColor(result.score)} mb-4`}>
            {getScoreMessage(result.score)}
          </p>

          <div className="flex gap-3 justify-center">
            {onRetake && (
              <button onClick={onRetake} className="btn btn-primary flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retake Quiz
              </button>
            )}
            {onViewArticle && (
              <button onClick={onViewArticle} className="btn btn-secondary flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Article
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Completed on {formatDate(result.completedAt)}
          </p>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Details</h2>

        <div className="space-y-6">
          {result.answers.map((answer: Answer, idx: number) => {
            const question = getQuestionById(answer.questionId);
            if (!question) return null;

            return (
              <div
                key={answer.questionId}
                className={`border rounded-lg p-5 ${
                  answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      answer.isCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {answer.isCorrect ? (
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          answer.isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {answer.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-white rounded text-gray-600">
                        {question.type === 'multiple-choice' && 'Multiple Choice'}
                        {question.type === 'true-false' && 'True/False'}
                        {question.type === 'open-ended' && 'Open-Ended'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {question.question}
                    </h3>
                  </div>
                </div>

                {/* Answer Details */}
                <div className="ml-11 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <p
                      className={`text-sm px-3 py-2 rounded ${
                        answer.isCorrect
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {Array.isArray(answer.userAnswer)
                        ? answer.userAnswer.join(', ')
                        : answer.userAnswer || 'No answer provided'}
                    </p>
                  </div>

                  {!answer.isCorrect && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                      <p className="text-sm px-3 py-2 bg-green-100 text-green-800 rounded">
                        {Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.join(', ')
                          : question.correctAnswer}
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-sm font-medium text-gray-700 mb-1">Explanation:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>

                  {/* Article Section Reference */}
                  {question.articleSection && (
                    <div className="flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
                      <svg
                        className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Reference in Article:
                        </p>
                        <p className="text-sm text-gray-600">{question.articleSection}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              </div>
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incorrect</p>
                <p className="text-2xl font-bold text-red-600">{totalCount - correctCount}</p>
              </div>
              <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-indigo-600">{percentage}%</p>
              </div>
              <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
