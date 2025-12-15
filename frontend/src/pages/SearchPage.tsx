import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import SearchResults from '../components/SearchResults';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'arxiv' | 'semantic-scholar' | 'both'>('both');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const isOnline = useOnlineStatus();
  
  const { 
    searchArxiv, 
    searchSemanticScholar, 
    arxivResults, 
    semanticScholarResults,
    isSearching 
  } = useSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !isOnline) return;

    const params = {
      query: query.trim(),
      maxResults,
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };

    if (source === 'arxiv' || source === 'both') {
      searchArxiv(params);
    }
    
    if (source === 'semantic-scholar' || source === 'both') {
      searchSemanticScholar(params);
    }
  };

  // Safely combine results with multiple layers of protection
  const safeArxivResults = (arxivResults && Array.isArray(arxivResults)) ? arxivResults : [];
  const safeSemanticResults = (semanticScholarResults && Array.isArray(semanticScholarResults)) ? semanticScholarResults : [];
  const allResults = [...safeArxivResults, ...safeSemanticResults];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Scientific Articles</h1>
      
      {/* Search Interface */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Query */}
          <div>
            <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords, authors, or topics..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isSearching}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value as 'arxiv' | 'semantic-scholar' | 'both')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSearching}
              >
                <option value="both">All Sources</option>
                <option value="arxiv">arXiv</option>
                <option value="semantic-scholar">Semantic Scholar</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSearching}
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSearching}
              />
            </div>

            {/* Max Results */}
            <div>
              <label htmlFor="max-results" className="block text-sm font-medium text-gray-700 mb-2">
                Max Results
              </label>
              <select
                id="max-results"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isSearching}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSearching || !query.trim() || !isOnline}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title={!isOnline ? 'Требуется подключение к интернету' : ''}
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      <SearchResults results={allResults} isLoading={isSearching} />
    </div>
  );
}
