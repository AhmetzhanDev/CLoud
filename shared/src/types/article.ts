import { z } from 'zod';

export const ArticleSourceSchema = z.enum(['upload', 'arxiv', 'semantic-scholar', 'url']);

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  content: z.string(),
  source: ArticleSourceSchema,
  sourceId: z.string().optional(),
  filePath: z.string().optional(),
  url: z.string().optional(),
  publicationDate: z.string().optional(),
  keywords: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleSource = z.infer<typeof ArticleSourceSchema>;

export const CreateArticleSchema = ArticleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateArticle = z.infer<typeof CreateArticleSchema>;
