/**
 * Shared constants for the frontend application
 */

// Categories
export const HABIT_CATEGORIES = ['productivity', 'health', 'mindfulness'] as const;
export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

export const GOAL_CATEGORIES = ['productivity', 'health', 'mindfulness'] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

// Category color styles - shared across components (habits, goals, articles)
export const CATEGORY_COLORS: Record<string, string> = {
  // Core categories
  health: "bg-growth-soft text-growth border-growth/20",
  productivity: "bg-primary/10 text-primary border-primary/20",
  mindfulness: "bg-calm-soft text-calm border-calm/20",
  // Goal-specific
  career: "bg-energy-soft text-energy border-energy/20",
  personal: "bg-calm-soft text-calm border-calm/20",
  // Article-specific
  philosophy: "bg-calm/10 text-calm",
  habits: "bg-growth/10 text-growth",
  relationships: "bg-energy/10 text-energy",
} as const;

// Layout dimensions (derive from CSS variables when possible)
export const SIDEBAR_WIDTH = 72;

// Breakpoints
export const MOBILE_BREAKPOINT = 768;

// API defaults
export const DEFAULT_PAGE_SIZE = 100;
