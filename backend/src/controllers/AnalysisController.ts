import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/AIService';
import { ArticleModel } from '../models/Article';
import { SummaryModel } from '../models/Summary';
import { ResearchDirectionModel } from '../models/ResearchDirection';
import { z } from 'zod';

const SummarizeRequestSchema = z.object({
  articleId: z.string().uuid(),
  forceRegenerate: z.boolean().optional().default(false),
});

export class AnalysisController {
  /**
   * Generate or retrieve a summary for an article
   * POST /api/analysis/summarize
   */
  static async summarize(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { articleId, forceRegenerate } = SummarizeRequestSchema.parse(req.body);

      // Check if article exists
      const article = await ArticleModel.findById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      // Check if summary already exists (unless force regenerate)
      if (!forceRegenerate) {
        const existingSummary = SummaryModel.findByArticleId(articleId);
        if (existingSummary) {
          res.json(existingSummary);
          return;
        }
      }

      // Generate summary using AI
      const systemPrompt = `You are an expert research assistant specializing in analyzing scientific articles. 
Your task is to create a structured summary of the provided article.

Return your response as a valid JSON object with the following structure:
{
  "objective": "The main research objective or goal of the study",
  "methodology": "The research methods and approaches used",
  "results": "The key findings and results of the study",
  "conclusions": "The main conclusions and implications",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"]
}

Be concise but comprehensive. Each section should be 2-4 sentences. Key findings should be 3-5 bullet points.`;

      const userPrompt = `Please analyze and summarize the following scientific article:

Title: ${article.title}
Authors: ${article.authors.join(', ')}

Abstract:
${article.abstract}

Full Content:
${article.content.substring(0, 15000)} ${article.content.length > 15000 ? '...(truncated)' : ''}

Provide a structured summary in JSON format.`;

      const aiResponse = await aiService.generateCompletion(
        userPrompt,
        systemPrompt,
        {
          temperature: 0.3, // Lower temperature for more focused analysis
          maxTokens: 2000,
        }
      );

      // Parse AI response
      let summaryData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }
        summaryData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        res.status(500).json({
          error: 'Failed to parse AI response',
          details: 'The AI service returned an invalid response format',
        });
        return;
      }

      // Validate the parsed data
      const SummaryDataSchema = z.object({
        objective: z.string(),
        methodology: z.string(),
        results: z.string(),
        conclusions: z.string(),
        keyFindings: z.array(z.string()),
      });

      const validatedData = SummaryDataSchema.parse(summaryData);

      // Save summary to database
      const summary = SummaryModel.create({
        articleId,
        ...validatedData,
      });

      res.status(201).json(summary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get summary by article ID
   * GET /api/analysis/:articleId
   */
  static async getSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { articleId } = req.params;

      const summary = SummaryModel.findByArticleId(articleId);
      if (!summary) {
        res.status(404).json({ error: 'Summary not found for this article' });
        return;
      }

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export summary as formatted text
   * GET /api/analysis/:articleId/export
   */
  static async exportSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { articleId } = req.params;

      // Get article and summary
      const article = await ArticleModel.findById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }

      const summary = SummaryModel.findByArticleId(articleId);
      if (!summary) {
        res.status(404).json({ error: 'Summary not found for this article' });
        return;
      }

      // Format as text document
      const exportText = `
================================================================================
RESEARCH ARTICLE SUMMARY
================================================================================

Title: ${article.title}
Authors: ${article.authors.join(', ')}
Publication Date: ${article.publicationDate || 'N/A'}
Source: ${article.source}
Generated: ${new Date(summary.createdAt).toLocaleString()}

================================================================================
OBJECTIVE
================================================================================

${summary.objective}

================================================================================
METHODOLOGY
================================================================================

${summary.methodology}

================================================================================
RESULTS
================================================================================

${summary.results}

================================================================================
CONCLUSIONS
================================================================================

${summary.conclusions}

================================================================================
KEY FINDINGS
================================================================================

${summary.keyFindings.map((finding, index) => `${index + 1}. ${finding}`).join('\n\n')}

================================================================================
ORIGINAL ABSTRACT
================================================================================

${article.abstract}

================================================================================
End of Summary
================================================================================
`.trim();

      // Set headers for text file download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="summary-${article.title.substring(0, 50).replace(/[^a-z0-9]/gi, '-')}.txt"`
      );

      res.send(exportText);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate research directions based on analyzed articles
   * POST /api/analysis/directions
   */
  static async generateDirections(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const DirectionsRequestSchema = z.object({
        articleIds: z.array(z.string().uuid()).min(1).max(10),
        count: z.number().min(3).max(10).optional().default(5),
      });

      const { articleIds, count } = DirectionsRequestSchema.parse(req.body);

      // Fetch all articles
      const articles = (
        await Promise.all(articleIds.map(id => ArticleModel.findById(id)))
      ).filter((article): article is NonNullable<typeof article> => article !== null);

      if (articles.length === 0) {
        res.status(404).json({ error: 'No valid articles found' });
        return;
      }

      // Try to get summaries for better context
      const summaries = articleIds
        .map(id => SummaryModel.findByArticleId(id))
        .filter(summary => summary !== null);

      // Build context for AI
      const articlesContext = articles
        .map((article, index) => {
          const summary = summaries[index];
          return `
Article ${index + 1}:
Title: ${article.title}
Authors: ${article.authors.join(', ')}
Abstract: ${article.abstract}
${summary ? `Key Findings: ${summary.keyFindings.join('; ')}` : ''}
`;
        })
        .join('\n---\n');

      const systemPrompt = `You are an expert research advisor specializing in identifying promising research directions.
Your task is to analyze multiple scientific articles following a structured 6-step research methodology.

Return your response as a valid JSON array with ${count} research direction objects, each with this structure:
{
  "title": "Brief, compelling title for the research direction",
  "description": "2-3 sentence description of the research direction",
  "researchQuestions": ["SMART Question 1", "SMART Question 2", "SMART Question 3"],
  "methodology": {
    "dataCollection": "Brief description of data collection approach",
    "preprocessing": "Brief description of data preprocessing steps",
    "methods": ["Method 1 with justification", "Method 2 with justification"],
    "evaluation": "Evaluation metrics and approach"
  },
  "pipeline": "Concise end-to-end pipeline description (max 100 words)",
  "relevanceScore": 0.85,
  "noveltyScore": 0.75,
  "rationale": "Detailed explanation of why this direction is promising",
  "risks": ["Risk 1", "Risk 2"],
  "limitations": ["Limitation 1", "Limitation 2"],
  "futureWork": ["Future improvement 1", "Future improvement 2"],
  "keyReferences": ["Key paper 1", "Key paper 2"]
}

IMPORTANT:
- Research questions must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Methods must include justification for why they are suitable
- Scores should be between 0 and 1
- Pipeline should be concise but complete (data → preprocessing → training → evaluation → reproducibility)`;

      const userPrompt = `You are an expert researcher. Work strictly step-by-step following this methodology:

ANALYZED ARTICLES:
${articlesContext}

STEP 1: EXPLORATION
Identify 3-5 most pressing open research problems from these articles that emerged in the last 2 years.
For each problem, describe: the core issue, current solution limitations, and why it matters.

STEP 2: TREND ANALYSIS
Analyze key trends and methods from highly-cited recent works (2022-2025) in this domain.
Identify under-explored aspects that could become strong research directions.

STEP 3: PROBLEM REFINEMENT
For each of the ${count} research directions you will propose:
- Formulate 3 SMART research questions (Specific, Measurable, Achievable, Relevant, Time-bound)
- Explain why each question is scientifically valuable

STEP 4: METHOD SUGGESTION
For each research question:
- Propose optimal methods/algorithms
- Explain why these methods are suitable
- Note limitations and expected performance/complexity

STEP 5: PIPELINE DESIGN
Design a concise end-to-end pipeline (max 100 words) covering:
- Data collection
- Cleaning/preprocessing
- Model selection and training
- Evaluation
- Reproducibility
Describe key characteristics and critical decisions for stable results.

STEP 6: FINAL OUTPUT
Generate ${count} research directions in JSON array format, each including:
- Final research title
- Brief summary (3-4 sentences)
- List of references/sources
- List of risks and limitations
- What can be improved in subsequent iterations

CRITICAL REQUIREMENTS:
1. Research questions must be SMART and actionable
2. Methods must be justified with clear reasoning
3. Consider gaps, trends, novel combinations, and contradictions from the articles
4. Rank by overall promise (relevance × novelty)
5. Be specific about methodologies, not generic

Provide ${count} research directions in JSON array format.`;

      const aiResponse = await aiService.generateCompletion(
        userPrompt,
        systemPrompt,
        {
          temperature: 0.7, // Higher temperature for creative suggestions
          maxTokens: 3000,
        }
      );

      // Parse AI response
      let directionsData;
      try {
        // Try to extract JSON array from the response
        const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in AI response');
        }
        directionsData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        res.status(500).json({
          error: 'Failed to parse AI response',
          details: 'The AI service returned an invalid response format',
        });
        return;
      }

      // Validate the parsed data
      const MethodologySchema = z.object({
        dataCollection: z.string(),
        preprocessing: z.string(),
        methods: z.array(z.string()),
        evaluation: z.string(),
      });

      const DirectionDataSchema = z.object({
        title: z.string(),
        description: z.string(),
        researchQuestions: z.array(z.string()).min(1),
        methodology: MethodologySchema.optional(),
        pipeline: z.string().optional(),
        relevanceScore: z.number().min(0).max(1),
        noveltyScore: z.number().min(0).max(1),
        rationale: z.string(),
        risks: z.array(z.string()).optional(),
        limitations: z.array(z.string()).optional(),
        futureWork: z.array(z.string()).optional(),
        keyReferences: z.array(z.string()).optional(),
      });

      const validatedDirections = z.array(DirectionDataSchema).parse(directionsData);

      // Save directions to database
      const savedDirections = validatedDirections.map(direction =>
        ResearchDirectionModel.create({
          articleIds,
          ...direction,
        })
      );

      // Sort by combined score (relevance × novelty)
      savedDirections.sort(
        (a, b) =>
          b.relevanceScore * b.noveltyScore - a.relevanceScore * a.noveltyScore
      );

      res.status(201).json(savedDirections);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  }
}
