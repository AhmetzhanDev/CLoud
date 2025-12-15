import api from './api';

export interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate?: string;
  url: string;
  source: 'arxiv' | 'semantic-scholar';
}

interface SearchParams {
  query: string;
  maxResults?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const searchApi = {
  // Search arXiv
  searchArxiv: async (params: SearchParams): Promise<SearchResult[]> => {
    try {
      const response = await api.get('/search/arxiv', { params });
      const entries = response.data.data?.entries || [];
      
      if (!Array.isArray(entries)) {
        console.warn('arXiv API returned non-array entries:', entries);
        return [];
      }
      
      // Transform arXiv entries to SearchResult format
      return entries.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        authors: entry.authors || [],
        abstract: entry.abstract || '',
        publicationDate: entry.publicationDate,
        url: entry.pdfUrl || `http://arxiv.org/abs/${entry.id}`,
        source: 'arxiv' as const,
      }));
    } catch (error) {
      console.error('Error in searchArxiv:', error);
      return [];
    }
  },

  // Search Semantic Scholar
  searchSemanticScholar: async (params: SearchParams): Promise<SearchResult[]> => {
    try {
      const response = await api.get('/search/semantic-scholar', { params });
      const papers = response.data.data?.papers || [];
      
      if (!Array.isArray(papers)) {
        console.warn('Semantic Scholar API returned non-array papers:', papers);
        return [];
      }
      
      // Transform Semantic Scholar papers to SearchResult format
      return papers.map((paper: any) => ({
        id: paper.paperId,
        title: paper.title,
        authors: paper.authors?.map((author: any) => author.name) || [],
        abstract: paper.abstract || '',
        publicationDate: paper.publicationDate,
        url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
        source: 'semantic-scholar' as const,
      }));
    } catch (error) {
      console.error('Error in searchSemanticScholar:', error);
      return [];
    }
  },

  // Import article from search results
  importArticle: async (searchResult: SearchResult): Promise<any> => {
    const response = await api.post('/search/import', searchResult);
    return response.data;
  },
};
