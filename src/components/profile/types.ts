import type {
  Profile,
  Settings,
  NotificationPreferences,
  AccountabilityStyle,
  PreferredTone,
  DifficultyPreference,
  BillingOverviewResponse,
} from "@/api";

export type SectionId = "profile" | "coaching" | "reminders" | "notifications" | "appearance" | "plan" | "data";

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

export const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "coaching", label: "Coaching" },
  { id: "reminders", label: "Reminders" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "plan", label: "Plan & billing" },
  { id: "data", label: "Data & privacy" },
];
