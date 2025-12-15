import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import fs from 'fs';

// Configure PDF.js worker
const workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFExtractionResult {
  text: string;
  metadata: PDFMetadata;
  pageCount: number;
}

export class PDFService {
  /**
   * Extract text and metadata from a PDF file
   */
  static async extractFromFile(filePath: string): Promise<PDFExtractionResult> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read the PDF file
      const data = new Uint8Array(fs.readFileSync(filePath));
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdfDocument = await loadingTask.promise;

      // Extract metadata
      const metadata = await this.extractMetadata(pdfDocument);

      // Extract text from all pages
      const pageCount = pdfDocument.numPages;
      const textPromises: Promise<string>[] = [];

      for (let i = 1; i <= pageCount; i++) {
        textPromises.push(this.extractPageText(pdfDocument, i));
      }

      const pageTexts = await Promise.all(textPromises);
      const text = pageTexts.join('\n\n');

      return {
        text,
        metadata,
        pageCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract PDF content: ${error.message}`);
      }
      throw new Error('Failed to extract PDF content: Unknown error');
    }
  }

  /**
   * Extract text from a specific page
   */
  private static async extractPageText(
    pdfDocument: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
  ): Promise<string> {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    
    // Combine text items
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    return text;
  }

  /**
   * Extract metadata from PDF
   */
  private static async extractMetadata(
    pdfDocument: pdfjsLib.PDFDocumentProxy
  ): Promise<PDFMetadata> {
    const metadata: PDFMetadata = {};

    try {
      const info = await pdfDocument.getMetadata();
      
      if (info.info) {
        const infoData = info.info as any;
        metadata.title = infoData.Title || undefined;
        metadata.author = infoData.Author || undefined;
        metadata.subject = infoData.Subject || undefined;
        metadata.keywords = infoData.Keywords || undefined;
        metadata.creator = infoData.Creator || undefined;
        metadata.producer = infoData.Producer || undefined;

        // Parse dates
        if (infoData.CreationDate) {
          metadata.creationDate = this.parsePDFDate(infoData.CreationDate);
        }
        if (infoData.ModDate) {
          metadata.modificationDate = this.parsePDFDate(infoData.ModDate);
        }
      }
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error);
    }

    return metadata;
  }

  /**
   * Parse PDF date format (D:YYYYMMDDHHmmSSOHH'mm')
   */
  private static parsePDFDate(dateString: string): Date | undefined {
    try {
      // Remove 'D:' prefix if present
      const cleaned = dateString.replace(/^D:/, '');
      
      // Extract date components
      const year = parseInt(cleaned.substring(0, 4), 10);
      const month = parseInt(cleaned.substring(4, 6), 10) - 1; // JS months are 0-indexed
      const day = parseInt(cleaned.substring(6, 8), 10);
      const hour = parseInt(cleaned.substring(8, 10), 10) || 0;
      const minute = parseInt(cleaned.substring(10, 12), 10) || 0;
      const second = parseInt(cleaned.substring(12, 14), 10) || 0;

      return new Date(year, month, day, hour, minute, second);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Extract abstract from PDF text (heuristic approach)
   */
  static extractAbstract(text: string): string {
    // Try to find abstract section
    const abstractRegex = /abstract[:\s]+(.*?)(?=\n\n|introduction|keywords|1\.|$)/is;
    const match = text.match(abstractRegex);
    
    if (match && match[1]) {
      return match[1].trim().substring(0, 1000); // Limit to 1000 chars
    }

    // Fallback: return first 500 characters
    return text.substring(0, 500).trim();
  }

  /**
   * Extract keywords from PDF text (heuristic approach)
   */
  static extractKeywords(text: string): string[] {
    const keywordsRegex = /keywords?[:\s]+(.*?)(?=\n\n|introduction|abstract|1\.|$)/is;
    const match = text.match(keywordsRegex);
    
    if (match && match[1]) {
      return match[1]
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 10); // Limit to 10 keywords
    }

    return [];
  }
}
