import type { HabitCategory, GoalCategory } from '@/api/types';

export type ArticleCategory =
  | 'productivity'
  | 'health'
  | 'mindfulness'
  | 'philosophy'
  | 'relationships'
  | 'psychology';

export type TemplateCategory = HabitCategory | GoalCategory;

export interface HabitTemplate {
  name: string;
  description: string;
  category: TemplateCategory;
}

export interface GoalTemplate {
  title: string;
  description: string;
  category: TemplateCategory;
  progress: number;
}
