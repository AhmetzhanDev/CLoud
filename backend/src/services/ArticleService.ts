import { ArticleModel } from '../models/Article';
import { Article, CreateArticle } from '../../../shared/src/types/article';
import { PDFService } from './PDFService';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

export class ArticleService {
  /**
   * Create article from uploaded PDF file
   */
  static async createFromUpload(
    filePath: string,
    originalName: string
  ): Promise<Article> {
    try {
      // Extract text and metadata from PDF
      const pdfData = await PDFService.extractFromFile(filePath);

      // Extract title from metadata or filename
      const title = pdfData.metadata.title || 
                   path.basename(originalName, path.extname(originalName));

      // Extract authors from metadata
      const authors = pdfData.metadata.author 
        ? pdfData.metadata.author.split(/[,;]/).map(a => a.trim())
        : [];

      // Extract abstract and keywords
      const abstract = PDFService.extractAbstract(pdfData.text);
      const keywords = PDFService.extractKeywords(pdfData.text);

      // Create article data
      const articleData: CreateArticle = {
        title,
        authors,
        abstract,
        content: pdfData.text,
        source: 'upload',
        filePath,
        keywords,
        publicationDate: pdfData.metadata.creationDate?.toISOString(),
      };

      // Save to database
      return await ArticleModel.create(articleData);
    } catch (error) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  /**
   * Create article from URL
   */
  static async createFromUrl(url: string): Promise<Article> {
    try {
      // Validate URL
      new URL(url); // Throws if invalid

      // Download file
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds
        maxContentLength: config.upload.maxFileSize,
      });

      // Check content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('URL does not point to a PDF file');
      }

      // Save to temporary file
      const fileName = `${uuidv4()}.pdf`;
      const filePath = path.join(config.upload.dir, fileName);
      fs.writeFileSync(filePath, response.data);

      // Extract filename from URL
      const urlPath = new URL(url).pathname;
      const originalName = path.basename(urlPath) || 'downloaded.pdf';

      // Process the PDF
      const pdfData = await PDFService.extractFromFile(filePath);

      // Extract title from metadata or URL
      const title = pdfData.metadata.title || 
                   path.basename(originalName, path.extname(originalName));

      // Extract authors from metadata
      const authors = pdfData.metadata.author 
        ? pdfData.metadata.author.split(/[,;]/).map(a => a.trim())
        : [];

      // Extract abstract and keywords
      const abstract = PDFService.extractAbstract(pdfData.text);
      const keywords = PDFService.extractKeywords(pdfData.text);

      // Create article data
      const articleData: CreateArticle = {
        title,
        authors,
        abstract,
        content: pdfData.text,
        source: 'url',
        url,
        filePath,
        keywords,
        publicationDate: pdfData.metadata.creationDate?.toISOString(),
      };

      // Save to database
      return await ArticleModel.create(articleData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to download or process PDF from URL: ${error.message}`);
      }
      throw new Error('Failed to download or process PDF from URL');
    }
  }

  /**
   * Get all articles with pagination
   */
  static async getAll(options?: {
    page?: number;
    limit?: number;
    source?: string;
  }): Promise<{ articles: Article[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const articles = await ArticleModel.findAll({
      limit,
      offset,
      source: options?.source,
    });

    const total = await ArticleModel.count(options?.source);
    const totalPages = Math.ceil(total / limit);

    return {
      articles,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get article by ID
   */
  static async getById(id: string): Promise<Article | null> {
    return ArticleModel.findById(id);
  }

  /**
   * Delete article and associated file
   */
  static async delete(id: string): Promise<boolean> {
    const article = await ArticleModel.findById(id);
    
    if (!article) {
      return false;
    }

    // Delete file if it exists
    if (article.filePath && fs.existsSync(article.filePath)) {
      try {
        fs.unlinkSync(article.filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }

    // Delete from database
    return ArticleModel.delete(id);
  }

  /**
   * Update article
   */
  static async update(id: string, data: Partial<CreateArticle>): Promise<Article | null> {
    return ArticleModel.update(id, data);
  }

  /**
   * Import article from external API (arXiv or Semantic Scholar)
   */
  static async importFromExternalAPI(data: {
    source: 'arxiv' | 'semantic-scholar';
    sourceId: string;
    title: string;
    authors: string[];
    abstract: string;
    pdfUrl?: string;
    publicationDate?: string;
    keywords?: string[];
    doi?: string;
  }): Promise<Article> {
    try {
      // Check if article already exists by sourceId
      const existing = await ArticleModel.findBySourceId(data.sourceId, data.source);
      if (existing) {
        throw new Error(`Article already imported: ${existing.title}`);
      }

      let filePath: string | undefined;
      let content = '';

      // Download PDF if URL is provided
      if (data.pdfUrl) {
        try {
          const response = await axios.get(data.pdfUrl, {
            responseType: 'arraybuffer',
            timeout: 60000, // 60 seconds for academic papers
            maxContentLength: config.upload.maxFileSize,
            headers: {
              'User-Agent': 'Research-Assistant/1.0',
            },
          });

          // Check content type
          const contentType = response.headers['content-type'];
          if (contentType && contentType.includes('application/pdf')) {
            // Save to file
            const fileName = `${data.source}-${data.sourceId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            filePath = path.join(config.upload.dir, fileName);
            fs.writeFileSync(filePath, response.data);

            // Extract text from PDF
            const pdfData = await PDFService.extractFromFile(filePath);
            content = pdfData.text;
          }
        } catch (error) {
          console.warn('Failed to download PDF, saving metadata only:', error);
          // Continue without PDF - we'll save metadata only
        }
      }

      // Create article data
      const articleData: CreateArticle = {
        title: data.title,
        authors: data.authors,
        abstract: data.abstract,
        content: content || data.abstract, // Use abstract if no PDF content
        source: data.source,
        sourceId: data.sourceId,
        filePath,
        keywords: data.keywords || [],
        publicationDate: data.publicationDate,
        url: data.pdfUrl,
      };

      // Save to database
      return ArticleModel.create(articleData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to import article: ${error.message}`);
      }
      throw new Error('Failed to import article');
    }
  }
}
