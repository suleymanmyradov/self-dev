import { z } from 'zod';

// Category slugs come from the DB categories table (fetched at runtime), not a
// hardcoded enum. Validate that it's a non-empty string; the DB FK enforces
// existence.
// Streak and completed are derived from check_ins history — not editable
// from the form. The form only edits name, description, and category.
export const HabitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Category is required'),
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
