import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '@/services/articlesApi';
import ResearchDirections from '@/components/ResearchDirections';

export default function DirectionsPage() {
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.getAll(),
  });

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticleIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const selectAll = () => {
    if (articles) {
      setSelectedArticleIds(articles.map((a) => a.id));
    }
  };

  const clearSelection = () => {
    setSelectedArticleIds([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Directions</h1>
        <p className="text-gray-600">
          Select articles to analyze and generate AI-powered research direction suggestions
        </p>
      </div>

      {/* Article Selection */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Articles ({selectedArticleIds.length} selected)
          </h2>
          <div className="flex gap-2">
            <button onClick={selectAll} className="btn btn-secondary text-sm">
              Select All
            </button>
            <button onClick={clearSelection} className="btn btn-secondary text-sm">
              Clear
            </button>
          </div>
        </div>

        {!articles || articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No articles available. Upload some articles first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => toggleArticleSelection(article.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedArticleIds.includes(article.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedArticleIds.includes(article.id)}
                    onChange={() => toggleArticleSelection(article.id)}
                    className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {article.authors.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {article.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Research Directions Component */}
      {selectedArticleIds.length > 0 ? (
        <ResearchDirections articleIds={selectedArticleIds} />
      ) : (
        <div className="card text-center py-12">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Selected</h3>
          <p className="text-gray-600">
            Select at least one article above to generate research direction suggestions
          </p>
        </div>
      )}
    </div>
  );
}
