import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/quizStore';
import type { Quiz, Question, Answer } from '@shared/types/quiz';

interface QuizInterfaceProps {
  quiz: Quiz;
  onSubmit: (answers: Answer[]) => void;
  isSubmitting?: boolean;
}

export default function QuizInterface({ quiz, onSubmit, isSubmitting = false }: QuizInterfaceProps) {
  const { currentAnswers, addAnswer } = useQuizStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string | string[]>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    // Initialize local answers from store
    const answersMap: Record<string, string | string[]> = {};
    currentAnswers.forEach((answer) => {
      answersMap[answer.questionId] = answer.userAnswer;
    });
    setLocalAnswers(answersMap);
  }, [currentAnswers]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setShowFeedback(false);
  };

  const checkAnswer = (question: Question, userAnswer: string | string[]): boolean => {
    const correctAnswer = question.correctAnswer;
    
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      // For multiple correct answers
      return correctAnswer.length === userAnswer.length &&
        correctAnswer.every((ans) => userAnswer.includes(ans));
    }
    
    if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
      return correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    }
    
    return false;
  };

  const handleCheckAnswer = () => {
    const userAnswer = localAnswers[currentQuestion.id];
    if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      return;
    }

    const isCorrect = checkAnswer(currentQuestion, userAnswer);
    
    setFeedback((prev) => ({
      ...prev,
      [currentQuestion.id]: isCorrect,
    }));
    setShowFeedback(true);

    // Save answer to store
    addAnswer({
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleSubmitQuiz = () => {
    // Ensure all questions have been answered
    const allAnswers: Answer[] = quiz.questions.map((question) => {
      const userAnswer = localAnswers[question.id] || '';
      const isCorrect = checkAnswer(question, userAnswer);
      
      return {
        questionId: question.id,
        userAnswer,
        isCorrect,
      };
    });

    onSubmit(allAnswers);
  };

  const isAnswered = (questionId: string): boolean => {
    const answer = localAnswers[questionId];
    return !!answer && (!Array.isArray(answer) || answer.length > 0);
  };

  const answeredCount = quiz.questions.filter((q) => isAnswered(q.id)).length;
  const canSubmit = answeredCount === quiz.questions.length;

  return (
    <div className="card">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span>
            {answeredCount} / {quiz.questions.length} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
            {currentQuestionIndex + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentQuestion.question}
            </h3>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {currentQuestion.type === 'multiple-choice' && 'Multiple Choice'}
              {currentQuestion.type === 'true-false' && 'True/False'}
              {currentQuestion.type === 'open-ended' && 'Open-Ended'}
            </span>
          </div>
        </div>

        {/* Answer Options */}
        <div className="ml-11">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                    localAnswers[currentQuestion.id] === option
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${showFeedback ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={localAnswers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    disabled={showFeedback}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    localAnswers[currentQuestion.id] === option
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${showFeedback ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={localAnswers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    disabled={showFeedback}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'open-ended' && (
            <textarea
              value={(localAnswers[currentQuestion.id] as string) || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              disabled={showFeedback}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Type your answer here..."
            />
          )}
        </div>
      </div>

      {/* Immediate Feedback */}
      {showFeedback && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            feedback[currentQuestion.id]
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start">
            {feedback[currentQuestion.id] ? (
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0"
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
                className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
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
            <div className="flex-1">
              <h4
                className={`text-sm font-medium ${
                  feedback[currentQuestion.id] ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {feedback[currentQuestion.id] ? 'Correct!' : 'Incorrect'}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  feedback[currentQuestion.id] ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {currentQuestion.explanation}
              </p>
              {currentQuestion.articleSection && (
                <p className="text-xs text-gray-600 mt-2">
                  Reference: {currentQuestion.articleSection}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="flex gap-2">
          {!showFeedback && isAnswered(currentQuestion.id) && (
            <button onClick={handleCheckAnswer} className="btn btn-secondary">
              Check Answer
            </button>
          )}

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button onClick={handleNext} className="btn btn-primary flex items-center gap-2">
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!canSubmit || isSubmitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Jump to Question:</p>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((question, idx) => (
            <button
              key={question.id}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowFeedback(false);
              }}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : isAnswered(question.id)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
