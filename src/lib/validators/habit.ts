import { z } from 'zod';
import { HABIT_CATEGORIES } from '@/lib/constants';

export const HabitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().default(''),
  category: z.enum(HABIT_CATEGORIES, { message: 'Invalid category' }),
  streak: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export const CreateHabitSchema = HabitSchema.pick({
  name: true,
  description: true,
  category: true,
});

export const UpdateHabitSchema = HabitSchema.partial().pick({
  name: true,
  description: true,
  category: true,
});

export type HabitFormValues = z.infer<typeof HabitSchema>;
export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;
export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;
