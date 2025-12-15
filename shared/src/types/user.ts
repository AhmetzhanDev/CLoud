import { z } from 'zod';

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  level: z.number(),
  points: z.number(),
  achievements: z.array(AchievementSchema),
  createdAt: z.string(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  level: true,
  points: true,
  achievements: true,
  createdAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
