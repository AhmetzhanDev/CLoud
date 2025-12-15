import { z } from 'zod';

export const MethodologySchema = z.object({
  dataCollection: z.string(),
  preprocessing: z.string(),
  methods: z.array(z.string()),
  evaluation: z.string(),
});

export const ResearchDirectionSchema = z.object({
  id: z.string(),
  articleIds: z.array(z.string()),
  title: z.string(),
  description: z.string(),
  researchQuestions: z.array(z.string()),
  methodology: MethodologySchema.optional(),
  pipeline: z.string().optional(),
  relevanceScore: z.number(),
  noveltyScore: z.number(),
  rationale: z.string(),
  risks: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  futureWork: z.array(z.string()).optional(),
  keyReferences: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export type Methodology = z.infer<typeof MethodologySchema>;
export type ResearchDirection = z.infer<typeof ResearchDirectionSchema>;

export const CreateResearchDirectionSchema = ResearchDirectionSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateResearchDirection = z.infer<typeof CreateResearchDirectionSchema>;
