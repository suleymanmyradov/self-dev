import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { CreateGoalSchema, type GoalFormValues, type MilestoneFormEntry } from '@/lib/validators/goal';
import type { Goal } from '@/api';

const DEFAULT_FORM: GoalFormValues = {
  title: '',
  description: '',
  category: '',
  progress: 0,
  relatedHabitIds: [],
  measurement: 'manual',
  startValue: 0,
  currentValue: 0,
  targetValue: 0,
  unit: '',
  milestones: [],
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

  const setMeasurement = useCallback((measurement: GoalFormValues['measurement']) => {
    setForm((f) => ({ ...f, measurement }));
  }, []);

  const setStartValue = useCallback((startValue: number) => {
    setForm((f) => ({ ...f, startValue }));
  }, []);

  const setCurrentValue = useCallback((currentValue: number) => {
    setForm((f) => ({ ...f, currentValue }));
  }, []);

  const setTargetValue = useCallback((targetValue: number) => {
    setForm((f) => ({ ...f, targetValue }));
  }, []);

  const setUnit = useCallback((unit: string) => {
    setForm((f) => ({ ...f, unit }));
  }, []);

  const setMilestones = useCallback((milestones: MilestoneFormEntry[]) => {
    setForm((f) => ({ ...f, milestones }));
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
      measurement: goal.measurement ?? 'manual',
      startValue: goal.startValue ?? 0,
      currentValue: goal.currentValue ?? 0,
      targetValue: goal.targetValue ?? 0,
      unit: goal.unit ?? '',
      milestones: goal.milestones?.map((m) => ({ id: m.id, title: m.title })) ?? [],
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
    // Type-specific validation
    const measurement = form.measurement ?? 'manual';
    if (measurement === 'habit' && (form.relatedHabitIds ?? []).length === 0) {
      setError('Habit goals require at least one linked habit');
      return null;
    }
    if (measurement === 'numeric' && (form.targetValue ?? 0) === (form.startValue ?? 0)) {
      setError('Target value must be different from start value');
      return null;
    }
    setError(null);
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dueDate: form.dueDate,
      relatedHabitIds: form.relatedHabitIds ?? [],
      measurement,
      startValue: form.startValue,
      currentValue: form.currentValue,
      targetValue: form.targetValue,
      unit: form.unit,
      milestones: form.milestones?.filter((m) => m.title.trim() !== '') ?? [],
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
    setMeasurement,
    setStartValue,
    setCurrentValue,
    setTargetValue,
    setUnit,
    setMilestones,
    toggleHabitId,
    reset,
    loadGoal,
    validate,
    setForm,
    setError,
  };
}
