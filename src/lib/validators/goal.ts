import { z } from 'zod';

export const GoalMeasurementSchema = z.enum(['binary', 'numeric', 'milestone', 'habit', 'manual']);

// MilestoneFormEntry is the form-state shape for milestone steps. On edit,
// id tracks the existing milestone's identity (preserves done_at on rename);
// empty/undefined id = new milestone. Create mode ignores id.
export const MilestoneFormEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string(),
});
export type MilestoneFormEntry = z.infer<typeof MilestoneFormEntrySchema>;

export const GoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Category is required'),
  dueDate: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  relatedHabitIds: z.array(z.string()).nullish(),
  measurement: GoalMeasurementSchema.optional().default('manual'),
  startValue: z.number().optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
  unit: z.string().max(32).optional(),
  milestones: z.array(MilestoneFormEntrySchema).optional(),
});

export const CreateGoalSchema = GoalSchema.pick({
  title: true,
  description: true,
  category: true,
  dueDate: true,
  relatedHabitIds: true,
  measurement: true,
  startValue: true,
  currentValue: true,
  targetValue: true,
  unit: true,
  milestones: true,
});

export const UpdateGoalSchema = GoalSchema.partial().pick({
  title: true,
  description: true,
  category: true,
  dueDate: true,
  relatedHabitIds: true,
  measurement: true,
  startValue: true,
  currentValue: true,
  targetValue: true,
  unit: true,
  milestones: true,
});

export const UpdateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

export type GoalFormValues = z.infer<typeof GoalSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
