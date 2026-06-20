import type { HabitTemplate, GoalTemplate } from '@/types/explore';

// Category slugs must match the categories table in the DB.
export const HABIT_TEMPLATES: HabitTemplate[] = [
  { name: 'Morning Walk', description: '15-minute walk to start the day fresh', category: 'leisure' },
  { name: 'Read 10 pages', description: 'Non-fiction personal growth', category: 'work' },
  { name: 'Meditate', description: '5–10 minutes of mindfulness', category: 'calm' },
];

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { title: 'Ship a side project', description: 'MVP within 4 weeks', category: 'work', progress: 0 },
  { title: 'Run 5K', description: 'Train 3x weekly for 6 weeks', category: 'leisure', progress: 0 },
  { title: '30-day meditation', description: 'Daily 10 minutes', category: 'calm', progress: 0 },
];
