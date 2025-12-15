import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchResult } from '@/services/searchApi';
import { useNavigate } from 'react-router-dom';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());
  const resultsPerPage = 10;
  const navigate = useNavigate();
  const { importArticle } = useSearch();

  // Calculate pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const handleImport = async (result: SearchResult) => {
    setImportingIds(prev => new Set(prev).add(result.id));
    
    try {
      await importArticle(result, {
        onSuccess: (data) => {
          // Navigate to the imported article
          if (data?.article?.id) {
            navigate(`/article/${data.article.id}`);
          }
        },
        onError: (error) => {
          console.error('Failed to import article:', error);
          alert('Failed to import article. Please try again.');
        },
        onSettled: () => {
          setImportingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(result.id);
            return newSet;
          });
        },
      });
    } catch (error) {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'arxiv':
        return 'bg-blue-100 text-blue-800';
      case 'semantic-scholar':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search query or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, results.length)} of {results.length} results
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {currentResults.map((result) => {
          const isImporting = importingIds.has(result.id);
          
          return (
            <div key={result.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Title and Source Badge */}
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {result.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceBadgeColor(result.source)}`}>
                      {result.source === 'arxiv' ? 'arXiv' : 'Semantic Scholar'}
                    </span>
                  </div>

                  {/* Authors */}
                  <p className="text-sm text-gray-600 mb-2">
                    {result.authors.length > 0 ? result.authors.join(', ') : 'Unknown authors'}
                  </p>

                  {/* Publication Date */}
                  {result.publicationDate && (
                    <p className="text-xs text-gray-500 mb-3">
                      Published: {formatDate(result.publicationDate)}
                    </p>
                  )}

                  {/* Abstract Preview */}
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    {result.abstract || 'No abstract available.'}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleImport(result)}
                      disabled={isImporting}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isImporting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Importing...
                        </span>
                      ) : (
                        'Import to Library'
                      )}
                    </button>
                    
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              const showEllipsis = 
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
