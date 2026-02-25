/**
 * Shared constants for the frontend application
 */

// Categories
export const HABIT_CATEGORIES = ['productivity', 'health', 'mindfulness'] as const;
export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

export const GOAL_CATEGORIES = ['productivity', 'health', 'mindfulness'] as const;
export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

// Layout dimensions
export const SIDEBAR_WIDTH = 72;
export const LEFT_PANEL_WIDTH = 280;
export const RIGHT_SIDEBAR_WIDTH = 320;

// Breakpoints
export const MOBILE_BREAKPOINT = 768;

// API defaults
export const API_TIMEOUT_MS = 30000;
export const DEFAULT_PAGE_SIZE = 100;

// Pagination
export const PAGINATION_LIMITS = [10, 25, 50, 100] as const;
