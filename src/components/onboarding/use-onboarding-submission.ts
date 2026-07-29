'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { createGoal, createHabit, updateSettings } from '@/api';
import { useOnboardingStore } from '@/store/onboarding';

export function useOnboardingSubmission() {
  const router = useRouter();
  const state = useOnboardingStore((s) => s.data);
  const setError = useOnboardingStore((s) => s.setError);
  const reset = useOnboardingStore((s) => s.reset);
  const submittingRef = useRef(false);

  const { mutateAsync: doCreateGoal, isPending: creatingGoal } = useMutation({
    mutationFn: createGoal,
  });
  const { mutateAsync: doCreateHabit, isPending: creatingHabit } = useMutation({
    mutationFn: ({ name, description, category }: Parameters<typeof createHabit>[0]) =>
      createHabit({ name, description, category }),
  });
  const { mutateAsync: doUpdateSettings, isPending: updatingSettings } = useMutation({
    mutationFn: updateSettings,
  });

  const isSubmitting = creatingGoal || creatingHabit || updatingSettings;

  const handleFinish = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    try {
      await doCreateGoal({
        title: state.goalTitle,
        description: state.motivation
          ? `Goal: ${state.goalTitle}. Motivation: ${state.motivation}`
          : state.goalTitle,
        category: state.goalCategory,
      });

      const selectedHabits = state.habitSuggestions.filter((h) => h.selected);
      await Promise.all(
        selectedHabits.map((habit) =>
          doCreateHabit({
            name: habit.name,
            description: habit.description,
            category: state.goalCategory,
          })
        )
      );

      await doUpdateSettings({
        accountabilityStyle: state.accountabilityStyle,
        checkInTime: state.checkInTime,
        onboardingCompleted: true,
      });

      reset();
      router.push('/plan');
    } catch {
      setError('Something went wrong. Please try again.');
      submittingRef.current = false;
    }
  };

  return { isSubmitting, handleFinish };
}
