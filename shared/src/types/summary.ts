import { z } from 'zod';

export const SummarySchema = z.object({
  id: z.string(),
  articleId: z.string(),
  objective: z.string(),
  methodology: z.string(),
  results: z.string(),
  conclusions: z.string(),
  keyFindings: z.array(z.string()),
  createdAt: z.string(),
});

export type Summary = z.infer<typeof SummarySchema>;

export const CreateSummarySchema = SummarySchema.omit({
  id: true,
  createdAt: true,
});

export type CreateSummary = z.infer<typeof CreateSummarySchema>;
