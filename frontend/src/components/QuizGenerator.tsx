import { useState } from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import type { QuestionType } from '@shared/types/quiz';

interface QuizGeneratorProps {
  articleId: string;
  onQuizGenerated?: (quizId: string) => void;
}

export default function QuizGenerator({ articleId, onQuizGenerated }: QuizGeneratorProps) {
  const { generateQuiz, isGenerating } = useQuiz();
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'multiple-choice',
    'true-false',
  ]);

  const questionTypes: { value: QuestionType; label: string; description: string }[] = [
    {
      value: 'multiple-choice',
      label: 'Multiple Choice',
      description: 'Questions with several options to choose from',
    },
    {
      value: 'true-false',
      label: 'True/False',
      description: 'Simple true or false statements',
    },
    {
      value: 'open-ended',
      label: 'Open-Ended',
      description: 'Questions requiring written answers',
    },
  ];

  const handleTypeToggle = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      // Don't allow deselecting if it's the last selected type
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleGenerate = () => {
    generateQuiz(
      {
        articleId,
        questionCount,
        questionTypes: selectedTypes,
      },
      {
        onSuccess: (quiz: any) => {
          if (onQuizGenerated) {
            onQuizGenerated(quiz.id);
          }
        },
      }
    );
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Quiz</h2>

      {/* Question Count */}
      <div className="mb-6">
        <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 mb-2">
          Number of Questions
        </label>
        <div className="flex items-center gap-4">
          <input
            id="question-count"
            type="range"
            min="5"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            disabled={isGenerating}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-lg font-semibold text-gray-900 w-12 text-center">
            {questionCount}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Select between 5 and 10 questions</p>
      </div>

      {/* Question Types */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Question Types
        </label>
        <div className="space-y-3">
          {questionTypes.map((type) => (
            <div
              key={type.value}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTypes.includes(type.value)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isGenerating && handleTypeToggle(type.value)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.value)}
                    onChange={() => handleTypeToggle(type.value)}
                    disabled={isGenerating || (selectedTypes.includes(type.value) && selectedTypes.length === 1)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <label className="font-medium text-gray-900 cursor-pointer">
                    {type.label}
                  </label>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select at least one question type
        </p>
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>
            This will generate <span className="font-semibold">{questionCount}</span> questions
            using <span className="font-semibold">{selectedTypes.length}</span> type(s)
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedTypes.length === 0}
          className="btn btn-primary flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Generate Quiz
            </>
          )}
        </button>
      </div>

      {/* Loading State Info */}
      {isGenerating && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Generating Quiz</h3>
              <p className="text-sm text-blue-700 mt-1">
                This may take up to 30 seconds. Please wait while we analyze the article and create your questions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
