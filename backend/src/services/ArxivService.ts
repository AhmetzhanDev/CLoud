import axios, { AxiosError } from 'axios';
import { parseStringPromise } from 'xml2js';
import { config } from '../config/env';

interface ArxivSearchParams {
  query: string;
  maxResults?: number;
  start?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
}

interface ArxivEntry {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: string;
  pdfUrl: string;
  categories: string[];
  doi?: string;
}

interface ArxivSearchResult {
  entries: ArxivEntry[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
}

export class ArxivService {
  private readonly baseUrl: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.baseUrl = config.externalAPIs.arxiv;
  }

  /**
   * Search arXiv for articles
   */
  async search(params: ArxivSearchParams): Promise<ArxivSearchResult> {
    const { query, maxResults = 10, start = 0, sortBy = 'relevance', sortOrder = 'descending' } = params;

    const searchQuery = this.buildSearchQuery(query);
    const url = `${this.baseUrl}?search_query=${encodeURIComponent(searchQuery)}&start=${start}&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    try {
      const response = await this.fetchWithRetry(url);
      return await this.parseArxivResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get article by arXiv ID
   */
  async getById(arxivId: string): Promise<ArxivEntry | null> {
    const url = `${this.baseUrl}?id_list=${arxivId}`;

    try {
      const response = await this.fetchWithRetry(url);
      const result = await this.parseArxivResponse(response);
      return result.entries.length > 0 ? result.entries[0] : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Build search query for arXiv API
   */
  private buildSearchQuery(query: string): string {
    // Simple query builder - can be enhanced with field-specific searches
    // Examples: ti:quantum (title), au:einstein (author), abs:neural (abstract)
    return query;
  }

  /**
   * Fetch with exponential backoff retry
   */
  private async fetchWithRetry(url: string, attempt: number = 1): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Research-Assistant/1.0',
        },
      });
      return response.data;
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Parse XML response from arXiv API
   */
  private async parseArxivResponse(xmlData: string): Promise<ArxivSearchResult> {
    try {
      const parsed = await parseStringPromise(xmlData, {
        explicitArray: false,
        mergeAttrs: true,
      });

      const feed = parsed.feed;
      
      if (!feed) {
        throw new Error('Invalid arXiv response format');
      }

      const totalResults = parseInt(feed['opensearch:totalResults'] || '0', 10);
      const startIndex = parseInt(feed['opensearch:startIndex'] || '0', 10);
      const itemsPerPage = parseInt(feed['opensearch:itemsPerPage'] || '0', 10);

      let entries: ArxivEntry[] = [];

      if (feed.entry) {
        const rawEntries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
        entries = rawEntries.map((entry: any) => this.parseEntry(entry));
      }

      return {
        entries,
        totalResults,
        startIndex,
        itemsPerPage,
      };
    } catch (error) {
      throw new Error(`Failed to parse arXiv response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse individual entry from arXiv response
   */
  private parseEntry(entry: any): ArxivEntry {
    const id = entry.id.replace('http://arxiv.org/abs/', '');
    const title = entry.title.replace(/\s+/g, ' ').trim();
    const abstract = entry.summary.replace(/\s+/g, ' ').trim();
    
    // Parse authors
    let authors: string[] = [];
    if (entry.author) {
      const authorList = Array.isArray(entry.author) ? entry.author : [entry.author];
      authors = authorList.map((author: any) => author.name);
    }

    // Parse categories
    let categories: string[] = [];
    if (entry.category) {
      const categoryList = Array.isArray(entry.category) ? entry.category : [entry.category];
      categories = categoryList.map((cat: any) => cat.term);
    }

    // Find PDF link
    let pdfUrl = '';
    if (entry.link) {
      const links = Array.isArray(entry.link) ? entry.link : [entry.link];
      const pdfLink = links.find((link: any) => link.type === 'application/pdf');
      pdfUrl = pdfLink?.href || `http://arxiv.org/pdf/${id}.pdf`;
    }

    // Parse publication date
    const publicationDate = entry.published || entry.updated || new Date().toISOString();

    // Extract DOI if available
    const doi = entry['arxiv:doi']?.$?.['xmlns:arxiv'];

    return {
      id,
      title,
      authors,
      abstract,
      publicationDate,
      pdfUrl,
      categories,
      doi,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Retry on network errors or 5xx server errors
      return !axiosError.response || (axiosError.response.status >= 500 && axiosError.response.status < 600);
    }
    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNABORTED') {
        return new Error('arXiv API request timeout');
      }
      if (axiosError.response) {
        return new Error(`arXiv API error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      }
      return new Error(`arXiv API network error: ${axiosError.message}`);
    }
    return error instanceof Error ? error : new Error('Unknown arXiv API error');
  }
}
