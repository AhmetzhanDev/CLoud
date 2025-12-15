import { useMemo, useState } from 'react';
import type { Quiz } from '@shared/types/quiz';

interface MatchingPairsGameProps {
  quiz: Quiz;
}

type PairItem = {
  id: string;
  question: string;
  answer: string;
};

export default function MatchingPairsGame({ quiz }: MatchingPairsGameProps) {
  // Берём пары из уже сгенерированного квиза: вопрос ↔ правильный ответ
  const pairs: PairItem[] = useMemo(
    () =>
      quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: Array.isArray(q.correctAnswer)
          ? q.correctAnswer.join(', ')
          : q.correctAnswer,
      })),
    [quiz],
  );

  // Перемешиваем левый и правый столбцы независимо
  const leftItems = useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5),
    [pairs],
  );
  const rightItems = useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5),
    [pairs],
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  const totalPairs = pairs.length;
  const matchedCount = matchedIds.size;

  const handleLeftClick = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (matchedIds.has(id)) return;

    const left = leftItems.find(i => i.id === selectedLeft);
    const right = rightItems.find(i => i.id === id);

    setSelectedRight(id);

    if (left && right && left.id === right.id) {
      // Совпадение — помечаем пару как найденную
      setMatchedIds(prev => {
        const next = new Set(prev);
        next.add(left.id);
        return next;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const allMatched = matchedIds.size === pairs.length && pairs.length > 0;

  return (
    <div className="card mt-6 border border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/40">
      <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Найди пары</h2>
          <p className="text-sm text-gray-600">
            Соедини вопрос слева с правильным ответом справа. Сначала выбери вопрос, затем ответ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm border border-amber-200">
            Найдено {matchedCount}/{totalPairs}
          </span>
          {selectedLeft || selectedRight ? (
            <button
              type="button"
              onClick={() => {
                setSelectedLeft(null);
                setSelectedRight(null);
              }}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 transition"
            >
              Сбросить выбор
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Левый столбец — вопросы */}
        <div className="p-3 rounded-xl bg-white/80 shadow-inner border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Вопросы</h3>
            <span className="text-[11px] text-gray-500">Выбери вопрос</span>
          </div>
          <div className="space-y-2">
            {leftItems.map(item => {
              const isMatched = matchedIds.has(item.id);
              const isSelected = selectedLeft === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isMatched}
                  className={`w-full text-left px-3 py-3 rounded-lg border text-sm transition-all shadow-sm ${
                    isMatched
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-100'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:translate-x-0.5'
                  }`}
                >
                  <span className="block font-medium text-gray-900 mb-1">{item.question}</span>
                  <span className="text-[11px] text-gray-500">Вопрос #{item.id.slice(0, 4)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Правый столбец — ответы */}
        <div className="p-3 rounded-xl bg-white/80 shadow-inner border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Ответы</h3>
            <span className="text-[11px] text-gray-500">Теперь выбери ответ</span>
          </div>
          <div className="space-y-2">
            {rightItems.map(item => {
              const isMatched = matchedIds.has(item.id);
              const isSelected = selectedRight === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRightClick(item.id)}
                  disabled={isMatched}
                  className={`w-full text-left px-3 py-3 rounded-lg border text-sm transition-all shadow-sm ${
                    isMatched
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-100'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:-translate-x-0.5'
                  }`}
                >
                  <span className="block font-medium text-gray-900 mb-1">{item.answer}</span>
                  <span className="text-[11px] text-gray-500">Ответ #{item.id.slice(0, 4)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {allMatched && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-900 font-semibold shadow-sm flex items-center gap-2">
          Отлично! Ты нашёл(ла) все пары. Можно вернуться к квизу или начать заново.
        </div>
      )}
    </div>
  );
}


