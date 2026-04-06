import type { HabitTemplate, GoalTemplate } from '@/types/explore';

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { name: 'Morning Walk', description: '15-minute walk to start the day fresh', category: 'health' },
  { name: 'Read 10 pages', description: 'Non-fiction personal growth', category: 'productivity' },
  { name: 'Meditate', description: '5–10 minutes of mindfulness', category: 'mindfulness' },
];

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { title: 'Ship a side project', description: 'MVP within 4 weeks', category: 'productivity', progress: 0 },
  { title: 'Run 5K', description: 'Train 3x weekly for 6 weeks', category: 'health', progress: 0 },
  { title: '30-day meditation', description: 'Daily 10 minutes', category: 'mindfulness', progress: 0 },
];
