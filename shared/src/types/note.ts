import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  articleId: z.string(),
  content: z.string(),
  articleSection: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteSchema = NoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateNote = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = CreateNoteSchema.partial();

export type UpdateNote = z.infer<typeof UpdateNoteSchema>;
