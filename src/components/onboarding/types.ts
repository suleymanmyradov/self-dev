import type { OnboardingData } from '@/store/onboarding';

export type UpdateField = <K extends keyof OnboardingData>(
  key: K,
  value: OnboardingData[K]
) => void;
