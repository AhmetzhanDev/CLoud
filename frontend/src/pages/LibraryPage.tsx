import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import ArticleUpload from '@/components/ArticleUpload';
import { t } from '@/i18n';

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
type FilterSource = 'all' | 'upload' | 'arxiv' | 'semantic-scholar' | 'url';

const ITEMS_PER_PAGE = 12;

export default function LibraryPage() {
  const navigate = useNavigate();
  const { articles, isLoading, error, deleteArticle } = useArticles();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    if (!articles) return [];

    let filtered = [...articles];

    // Apply source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(article => article.source === filterSource);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.authors.some(author => author.toLowerCase().includes(query)) ||
        article.abstract.toLowerCase().includes(query) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [articles, filterSource, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredAndSortedArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (source: FilterSource) => {
    setFilterSource(source);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('library.deleteConfirm'))) {
      deleteArticle(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'arxiv':
        return 'bg-blue-100 text-blue-800';
      case 'semantic-scholar':
        return 'bg-purple-100 text-purple-800';
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'url':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Article Library</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Article Library</h1>
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">Error loading articles: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Article Library</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary"
        >
          {showUpload ? 'Hide Upload' : 'Upload Article'}
        </button>
      </div>

      {/* Upload Component */}
      {showUpload && (
        <div className="mb-6">
          <ArticleUpload />
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title, author, keywords..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Source Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Source
          </label>
          <div className="flex flex-wrap gap-2">
            {(['all', 'upload', 'arxiv', 'semantic-scholar', 'url'] as FilterSource[]).map((source) => (
              <button
                key={source}
                onClick={() => handleFilterChange(source)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterSource === source
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {source === 'all' ? 'All' : source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {paginatedArticles.length} of {filteredAndSortedArticles.length} articles
      </div>

      {/* Articles Grid */}
      {paginatedArticles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchQuery || filterSource !== 'all'
              ? 'No articles found matching your filters.'
              : 'No articles yet. Upload your first article to get started!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {paginatedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/article/${article.id}`)}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadgeColor(article.source)}`}>
                    {article.source}
                  </span>
                  <button
                    onClick={(e) => handleDeleteArticle(article.id, e)}
                    className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete article"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>

                {/* Authors */}
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {article.authors.join(', ')}
                </p>

                {/* Abstract */}
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {article.abstract}
                </p>

                {/* Keywords */}
                {article.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.keywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {article.keywords.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{article.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>{formatDate(article.createdAt)}</span>
                  {article.publicationDate && (
                    <span>Published: {formatDate(article.publicationDate)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
