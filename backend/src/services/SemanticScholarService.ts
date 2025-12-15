import axios, { AxiosError } from 'axios';
import { config } from '../config/env';

interface SemanticScholarSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  year?: string;
  venue?: string;
  fieldsOfStudy?: string[];
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: Array<{
    authorId: string;
    name: string;
  }>;
  abstract: string | null;
  year: number | null;
  venue: string | null;
  citationCount: number;
  referenceCount: number;
  influentialCitationCount: number;
  isOpenAccess: boolean;
  openAccessPdf: {
    url: string;
    status: string;
  } | null;
  fieldsOfStudy: string[] | null;
  publicationDate: string | null;
  externalIds: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;
  } | null;
  url: string;
}

interface SemanticScholarSearchResult {
  papers: SemanticScholarPaper[];
  total: number;
  offset: number;
  next?: number;
}

export class SemanticScholarService {
  private readonly baseUrl: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;
  private readonly rateLimit: RateLimiter;

  constructor() {
    this.baseUrl = config.externalAPIs.semanticScholar;
    // Semantic Scholar allows 100 requests per 5 minutes
    this.rateLimit = new RateLimiter(100, 5 * 60 * 1000);
  }

  /**
   * Search Semantic Scholar for papers
   */
  async search(params: SemanticScholarSearchParams): Promise<SemanticScholarSearchResult> {
    const { 
      query, 
      limit = 10, 
      offset = 0,
      fields = ['paperId', 'title', 'authors', 'abstract', 'year', 'venue', 'citationCount', 'referenceCount', 'influentialCitationCount', 'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 'publicationDate', 'externalIds', 'url'],
      year,
      venue,
      fieldsOfStudy
    } = params;

    await this.rateLimit.waitForToken();

    const url = `${this.baseUrl}/paper/search`;
    const queryParams: any = {
      query,
      limit: Math.min(limit, 100), // API max is 100
      offset,
      fields: fields.join(','),
    };

    if (year) {
      queryParams.year = year;
    }
    if (venue) {
      queryParams.venue = venue;
    }
    if (fieldsOfStudy && fieldsOfStudy.length > 0) {
      queryParams.fieldsOfStudy = fieldsOfStudy.join(',');
    }

    try {
      const response = await this.fetchWithRetry(url, queryParams);
      return {
        papers: response.data || [],
        total: response.total || 0,
        offset: response.offset || 0,
        next: response.next,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get paper by Semantic Scholar ID
   */
  async getById(paperId: string, fields?: string[]): Promise<SemanticScholarPaper | null> {
    await this.rateLimit.waitForToken();

    const defaultFields = ['paperId', 'title', 'authors', 'abstract', 'year', 'venue', 'citationCount', 'referenceCount', 'influentialCitationCount', 'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 'publicationDate', 'externalIds', 'url'];
    const fieldsParam = (fields || defaultFields).join(',');
    const url = `${this.baseUrl}/paper/${paperId}?fields=${fieldsParam}`;

    try {
      const response = await this.fetchWithRetry(url);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get paper by external ID (DOI, ArXiv, etc.)
   */
  async getByExternalId(externalId: string, fields?: string[]): Promise<SemanticScholarPaper | null> {
    await this.rateLimit.waitForToken();

    const defaultFields = ['paperId', 'title', 'authors', 'abstract', 'year', 'venue', 'citationCount', 'referenceCount', 'influentialCitationCount', 'isOpenAccess', 'openAccessPdf', 'fieldsOfStudy', 'publicationDate', 'externalIds', 'url'];
    const fieldsParam = (fields || defaultFields).join(',');
    
    // External ID can be DOI, ArXiv ID, etc.
    // Format: DOI:10.1234/example or ArXiv:1234.5678
    const url = `${this.baseUrl}/paper/${externalId}?fields=${fieldsParam}`;

    try {
      const response = await this.fetchWithRetry(url);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  /**
   * Fetch with exponential backoff retry and rate limiting
   */
  private async fetchWithRetry(url: string, params?: any, attempt: number = 1): Promise<any> {
    try {
      const response = await axios.get(url, {
        params,
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
        return this.fetchWithRetry(url, params, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Retry on network errors, 429 (rate limit), or 5xx server errors
      if (!axiosError.response) return true;
      const status = axiosError.response.status;
      return status === 429 || (status >= 500 && status < 600);
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
        return new Error('Semantic Scholar API request timeout');
      }
      if (axiosError.response) {
        const status = axiosError.response.status;
        if (status === 429) {
          return new Error('Semantic Scholar API rate limit exceeded. Please try again later.');
        }
        return new Error(`Semantic Scholar API error: ${status} - ${axiosError.response.statusText}`);
      }
      return new Error(`Semantic Scholar API network error: ${axiosError.message}`);
    }
    return error instanceof Error ? error : new Error('Unknown Semantic Scholar API error');
  }
}

/**
 * Rate limiter to respect API limits
 */
class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxTokens = maxRequests;
    this.tokens = maxRequests;
    this.refillRate = maxRequests / windowMs;
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refill();
    
    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate;
      await this.sleep(waitTime);
      this.refill();
    }
    
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
