'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getSafeStorage } from '@/lib/safe-storage';
import type { GoalCategory } from '@/api/types';
import type { AccountabilityStyle } from '@/lib/constants';

export type HabitSuggestion = {
  name: string;
  description: string;
  selected: boolean;
};

export type OnboardingData = {
  goalTitle: string;
  goalCategory: GoalCategory;
  motivation: string;
  blocker: string;
  dailyMinutes: number;
  accountabilityStyle: AccountabilityStyle;
  checkInTime: string;
  habitSuggestions: HabitSuggestion[];
};

export const TOTAL_STEPS = 7;

const initialData: OnboardingData = {
  goalTitle: '',
  goalCategory: 'productivity',
  motivation: '',
  blocker: '',
  dailyMinutes: 30,
  accountabilityStyle: 'balanced',
  checkInTime: '09:00',
  habitSuggestions: [],
};

interface OnboardingStore {
  step: number;
  data: OnboardingData;
  loadingHabits: boolean;
  error: string | null;
  hasHydrated: boolean;
  updateField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setLoadingHabits: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHabitSuggestions: (suggestions: HabitSuggestion[]) => void;
  toggleHabitSelection: (index: number) => void;
  reset: () => void;
  setHydrated: (state: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      data: initialData,
      loadingHabits: false,
      error: null,
      hasHydrated: false,
      updateField: (key, value) =>
        set((state) => ({
          data: { ...state.data, [key]: value },
        })),
      nextStep: () =>
        set((state) => ({
          step: Math.min(state.step + 1, TOTAL_STEPS),
        })),
      prevStep: () =>
        set((state) => ({
          step: Math.max(state.step - 1, 1),
        })),
      goToStep: (step) =>
        set(() => ({
          step: Math.max(1, Math.min(step, TOTAL_STEPS)),
        })),
      setLoadingHabits: (loading) => set({ loadingHabits: loading }),
      setError: (error) => set({ error }),
      setHabitSuggestions: (suggestions) =>
        set((state) => ({
          data: { ...state.data, habitSuggestions: suggestions },
        })),
      toggleHabitSelection: (index) =>
        set((state) => {
          const updated = [...state.data.habitSuggestions];
          if (updated[index]) {
            updated[index] = { ...updated[index], selected: !updated[index].selected };
          }
          return { data: { ...state.data, habitSuggestions: updated } };
        }),
      reset: () =>
        set(() => ({
          step: 1,
          data: initialData,
          loadingHabits: false,
          error: null,
        })),
      setHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(getSafeStorage),
      partialize: (state) => ({
        step: state.step,
        data: state.data,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.setHydrated(true);
        }
      },
    }
  )
);
