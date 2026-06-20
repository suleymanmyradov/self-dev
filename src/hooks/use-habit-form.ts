import { useState, useCallback } from 'react';
import { CreateHabitSchema, type HabitFormValues } from '@/lib/validators/habit';
import type { Habit } from '@/api';

const DEFAULT_FORM: HabitFormValues = {
  name: '',
  description: '',
  category: '', // set from the DB categories dropdown
};

export function useHabitForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HabitFormValues>(DEFAULT_FORM);

  const reset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setOpen(false);
  }, []);

  const validate = useCallback(() => {
    const parsed = CreateHabitSchema.safeParse(form);
    return parsed.success ? parsed.data : null;
  }, [form]);

  return {
    open,
    setOpen,
    form,
    setForm,
    reset,
    validate,
  };
}

export function useHabitEditForm() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HabitFormValues>(DEFAULT_FORM);

  const openEdit = useCallback((habit: Habit) => {
    setEditingId(habit.id);
    setForm({
      name: habit.name,
      description: habit.description,
      category: habit.category,
    });
    setOpen(true);
  }, []);

  const reset = useCallback(() => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setOpen(false);
  }, []);

  const validate = useCallback(() => {
    const parsed = CreateHabitSchema.safeParse(form);
    return parsed.success ? parsed.data : null;
  }, [form]);

  return {
    open,
    setOpen,
    editingId,
    form,
    setForm,
    openEdit,
    reset,
    validate,
  };
}
