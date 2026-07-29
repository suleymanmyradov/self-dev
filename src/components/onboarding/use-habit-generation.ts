'use client';

import { useRef } from 'react';
import { generateOnboardingHabits } from '@/api';
import { useOnboardingStore } from '@/store/onboarding';

export function useHabitGeneration() {
  const state = useOnboardingStore((s) => s.data);
  const setLoadingHabits = useOnboardingStore((s) => s.setLoadingHabits);
  const setError = useOnboardingStore((s) => s.setError);
  const setHabitSuggestions = useOnboardingStore((s) => s.setHabitSuggestions);
  const generatingRef = useRef(false);

  const generateHabits = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setLoadingHabits(true);
    setError(null);
    try {
      const habits = await generateOnboardingHabits({
        goalTitle: state.goalTitle,
        goalCategory: state.goalCategory,
        motivation: state.motivation,
        blocker: state.blocker,
        dailyMinutes: state.dailyMinutes,
        accountabilityStyle: state.accountabilityStyle,
      });

      const suggestions = habits.slice(0, 3).map((h) => ({
        name: h.name,
        description: h.description,
        selected: true,
      }));

      setHabitSuggestions(suggestions);
    } catch {
      const fallback = [
        {
          name: `Work on ${state.goalTitle} for ${Math.round(state.dailyMinutes / 3)} minutes`,
          description: 'Set a timer and focus exclusively on this task.',
          selected: true,
        },
        {
          name: 'Review your plan for tomorrow',
          description: 'Spend 5 minutes each evening reviewing what you will do next.',
          selected: true,
        },
        {
          name: 'Track your progress',
          description: 'Write one sentence about what you accomplished today.',
          selected: true,
        },
      ];
      setHabitSuggestions(fallback);
    } finally {
      setLoadingHabits(false);
      generatingRef.current = false;
    }
  };

  return { generateHabits };
}
