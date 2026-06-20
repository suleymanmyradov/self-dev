// Category slugs come from the DB categories table (string), shared by habits and goals.
export type TemplateCategory = string;

export type ArticleCategory =
  | 'productivity'
  | 'health'
  | 'mindfulness'
  | 'philosophy'
  | 'relationships'
  | 'psychology';

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
