/**
 * Shared constants for the frontend application
 */

// Categories
// Category slugs come from the DB categories table, not a hardcoded enum.
// See useCategories() hook and the categories API.

// Category color styles - shared across components (habits, goals, articles)
// All entries use consistent pattern: bg-*-soft text-* border-*/20
export const CATEGORY_COLORS: Record<string, string> = {
  // Core categories (legacy frontend enum — kept for backward compat)
  health: "bg-growth-soft text-growth border-growth/20",
  productivity: "bg-primary/10 text-primary border-primary/20",
  mindfulness: "bg-calm-soft text-calm border-calm/20",
  // Actual DB category slugs (categories table)
  calm: "bg-calm-soft text-calm border-calm/20",
  leisure: "bg-energy-soft text-energy border-energy/20",
  relationships: "bg-energy-soft text-energy border-energy/20",
  "self-knowledge": "bg-primary/10 text-primary border-primary/20",
  sociability: "bg-energy-soft text-energy border-energy/20",
  work: "bg-primary/10 text-primary border-primary/20",
  // Goal-specific
  career: "bg-energy-soft text-energy border-energy/20",
  personal: "bg-calm-soft text-calm border-calm/20",
  // Article-specific
  philosophy: "bg-calm-soft text-calm border-calm/20",
  habits: "bg-growth-soft text-growth border-growth/20",
  // Additional common article categories
  learning: "bg-primary/10 text-primary border-primary/20",
  wellness: "bg-growth-soft text-growth border-growth/20",
  technology: "bg-calm-soft text-calm border-calm/20",
} as const;

// Layout dimensions (derive from CSS variables when possible)
export const SIDEBAR_WIDTH = 72;

// Breakpoints
export const MOBILE_BREAKPOINT = 768;

// Accountability styles
export const ACCOUNTABILITY_STYLES = ['gentle', 'balanced', 'strict'] as const;
export type AccountabilityStyle = (typeof ACCOUNTABILITY_STYLES)[number];

export const ACCOUNTABILITY_STYLE_LABELS: Record<AccountabilityStyle, string> = {
  gentle: 'Gentle',
  balanced: 'Balanced',
  strict: 'Strict',
};

export const ACCOUNTABILITY_STYLE_DESCRIPTIONS: Record<AccountabilityStyle, string> = {
  gentle: 'Supportive and understanding — I\'ll meet you where you are.',
  balanced: 'Honest but kind — the best default for most people.',
  strict: 'No excuses — I\'ll push you to follow through on your commitments.',
};

export const ACCOUNTABILITY_STYLE_TONES: Record<AccountabilityStyle, string> = {
  gentle: 'That\'s okay. Let\'s understand what got in the way and make tomorrow easier.',
  balanced: 'You missed today, but the goal still matters. Let\'s adjust the plan and protect tomorrow.',
  strict: 'You committed to this. What specific obstacle blocked execution, and what will you change tomorrow?',
};

// Check-in time options
export const CHECK_IN_HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
] as const;

// Daily time commitment options (minutes)
export const DAILY_COMMITMENT_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
] as const;

// API defaults
export const DEFAULT_PAGE_SIZE = 100;
