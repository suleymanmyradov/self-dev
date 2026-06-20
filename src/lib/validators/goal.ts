import { z } from 'zod';

export const GoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  relatedHabitIds: z.array(z.string()).nullish(),
});

export const CreateGoalSchema = GoalSchema.pick({
  title: true,
  description: true,
  category: true,
  dueDate: true,
  relatedHabitIds: true,
});

export const UpdateGoalSchema = GoalSchema.partial().pick({
  title: true,
  description: true,
  category: true,
  dueDate: true,
  relatedHabitIds: true,
});

export const UpdateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

export type GoalFormValues = z.infer<typeof GoalSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
