import type {
  Profile,
  Settings,
  NotificationPreferences,
  AccountabilityStyle,
  PreferredTone,
  DifficultyPreference,
  BillingOverviewResponse,
} from "@/api";

export type SectionId = "profile" | "coaching" | "memory" | "reminders" | "notifications" | "appearance" | "plan" | "data";

export interface ProfileClientProps {
  profile: Profile;
  settings: Settings | null;
  coachingProfile: {
    accountabilityStyle: AccountabilityStyle;
    preferredTone: PreferredTone;
    difficultyPreference: DifficultyPreference;
  } | null;
  notificationPreferences: NotificationPreferences | null;
  billingInitialData?: BillingOverviewResponse;
}

export const COACHING_STYLES: {
  id: AccountabilityStyle;
  label: string;
  quote: string;
}[] = [
  {
    id: "gentle",
    label: "Gentle",
    quote: "That's okay. Let's make tomorrow easier.",
  },
  {
    id: "balanced",
    label: "Balanced",
    quote: "You missed today, but the goal still matters. Let's protect tomorrow.",
  },
  {
    id: "strict",
    label: "Direct",
    quote: "You committed to this. What blocked it, and what changes tomorrow?",
  },
];

export const COACHING_TONES: {
  id: PreferredTone;
  label: string;
  description: string;
}[] = [
  { id: "supportive", label: "Supportive", description: "Warm and encouraging" },
  { id: "direct", label: "Direct", description: "Straight to the point" },
  { id: "warm", label: "Warm", description: "Friendly and personal" },
  { id: "practical", label: "Practical", description: "Action-oriented, no fluff" },
  { id: "challenging", label: "Challenging", description: "Pushes you to do more" },
];

export const COACHING_DIFFICULTIES: {
  id: DifficultyPreference;
  label: string;
  description: string;
}[] = [
  { id: "easy", label: "Easy", description: "Small, safe steps" },
  { id: "adaptive", label: "Adaptive", description: "Adjusts to your pace" },
  { id: "ambitious", label: "Ambitious", description: "Stretch goals" },
];

export const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "coaching", label: "Coaching" },
  { id: "memory", label: "Memory" },
  { id: "reminders", label: "Reminders" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "plan", label: "Plan & billing" },
  { id: "data", label: "Data & privacy" },
];
