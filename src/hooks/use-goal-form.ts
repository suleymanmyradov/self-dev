import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { CreateGoalSchema, type GoalFormValues } from '@/lib/validators/goal';
import type { Goal } from '@/api';

const DEFAULT_FORM: GoalFormValues = {
  title: '',
  description: '',
  category: '',
  progress: 0,
  relatedHabitIds: [],
};

export function useGoalForm(initial?: Partial<GoalFormValues>) {
  const initialRef = useRef(initial);
  useLayoutEffect(() => {
    initialRef.current = initial;
  });

  const [form, setForm] = useState<GoalFormValues>({
    ...DEFAULT_FORM,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);

  const setTitle = useCallback((title: string) => {
    setForm((f) => ({ ...f, title }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setForm((f) => ({ ...f, description }));
  }, []);

  const setCategory = useCallback((category: GoalFormValues['category']) => {
    setForm((f) => ({ ...f, category }));
  }, []);

  const setDueDate = useCallback((dueDate: string | undefined) => {
    setForm((f) => ({ ...f, dueDate }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setForm((f) => ({ ...f, progress }));
  }, []);

  const toggleHabitId = useCallback((habitId: string) => {
    setForm((f) => {
      const current = f.relatedHabitIds ?? [];
      const next = current.includes(habitId)
        ? current.filter((id) => id !== habitId)
        : [...current, habitId];
      return { ...f, relatedHabitIds: next };
    });
  }, []);

  const reset = useCallback((override?: Partial<GoalFormValues>) => {
    setForm({ ...DEFAULT_FORM, ...(override ?? initialRef.current) });
    setError(null);
  }, []);

  const loadGoal = useCallback((goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      dueDate: goal.dueDate,
      progress: goal.progress,
      relatedHabitIds: goal.relatedHabitIds ?? [],
    });
    setError(null);
  }, []);

  const validate = useCallback(() => {
    const parsed = CreateGoalSchema.safeParse(form);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Invalid input';
      setError(message);
      return null;
    }
    setError(null);
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dueDate: form.dueDate,
      relatedHabitIds: form.relatedHabitIds ?? [],
    };
  }, [form]);

  return {
    form,
    error,
    setTitle,
    setDescription,
    setCategory,
    setDueDate,
    setProgress,
    toggleHabitId,
    reset,
    loadGoal,
    validate,
    setForm,
    setError,
  };
}
