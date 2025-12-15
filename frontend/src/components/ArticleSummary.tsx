import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/services/analysisApi';
import type { Summary } from '@shared/types/summary';

interface ArticleSummaryProps {
  articleId: string;
  articleTitle?: string;
}

export default function ArticleSummary({ articleId, articleTitle }: ArticleSummaryProps) {
  const queryClient = useQueryClient();

  // Fetch or get cached summary
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['article-summary', articleId],
    queryFn: () => analysisApi.getAnalysis(articleId),
    retry: false,
  });

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: () => analysisApi.generateSummary(articleId),
    onSuccess: (data: Summary) => {
      queryClient.setQueryData(['article-summary', articleId], data);
    },
  });

  // Export summary mutation
  const exportSummaryMutation = useMutation({
    mutationFn: () => analysisApi.exportSummary(articleId),
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${articleTitle || 'summary'}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (summaryLoading || generateSummaryMutation.isPending) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">
            {generateSummaryMutation.isPending ? 'Generating summary...' : 'Loading summary...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds</p>
        </div>
      </div>
    );
  }

  // No summary available - show generate button
  if (summaryError || !summary) {
    return (
      <div className="card">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Available</h3>
          <p className="text-gray-600 mb-6">
            Generate an AI-powered summary to quickly understand the key points of this article.
          </p>
          <button
            onClick={() => generateSummaryMutation.mutate()}
            disabled={generateSummaryMutation.isPending}
            className="btn btn-primary"
          >
            Generate Summary
          </button>
          {generateSummaryMutation.isError && (
            <p className="text-red-600 text-sm mt-4">
              Failed to generate summary. Please try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Display summary
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Article Summary</h2>
        <button
          onClick={() => exportSummaryMutation.mutate()}
          disabled={exportSummaryMutation.isPending}
          className="btn btn-secondary flex items-center gap-2"
        >
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {exportSummaryMutation.isPending ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Objective Section */}
        <div className="border-l-4 border-indigo-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Objective
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.objective}</p>
        </div>

        {/* Methodology Section */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Methodology
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.methodology}</p>
        </div>

        {/* Results Section */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Results
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.results}</p>
        </div>

        {/* Conclusions Section */}
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Conclusions
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.conclusions}</p>
        </div>

        {/* Key Findings Section */}
        {summary.keyFindings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Key Findings
            </h3>
            <ul className="space-y-2">
              {summary.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 flex-1">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Generated on {formatDate(summary.createdAt)}
          </div>
          <button
            onClick={() => generateSummaryMutation.mutate()}
            disabled={generateSummaryMutation.isPending}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Regenerate Summary
          </button>
        </div>
      </div>

      {exportSummaryMutation.isError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Failed to export summary. Please try again.</p>
        </div>
      )}
    </div>
  );
}
