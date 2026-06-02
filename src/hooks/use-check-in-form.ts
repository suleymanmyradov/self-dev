import { useState, useCallback } from 'react';
import type { CheckInStatus, CheckInMood, CheckInEnergy, CheckInBlocker } from '@/api';

export type CheckInFormState = {
  status: CheckInStatus | null;
  mood: CheckInMood | null;
  energy: CheckInEnergy | null;
  blocker: CheckInBlocker | null;
  otherBlocker: string;
  note: string;
};

const initialState: CheckInFormState = {
  status: null,
  mood: null,
  energy: null,
  blocker: null,
  otherBlocker: '',
  note: '',
};

export function useCheckInForm() {
  const [form, setForm] = useState<CheckInFormState>(initialState);

  const updateField = useCallback(<K extends keyof CheckInFormState>(key: K, value: CheckInFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setForm(initialState);
  }, []);

  const canSubmit = form.status && (
    form.status === 'completed'
      ? form.mood && form.energy
      : form.blocker && (form.blocker !== 'other' || form.otherBlocker.trim())
  );

  const finalNote = form.blocker === 'other' && form.otherBlocker.trim()
    ? `Blocker: ${form.otherBlocker.trim()}${form.note.trim() ? `\n\n${form.note.trim()}` : ''}`
    : form.note.trim();

  return {
    form,
    updateField,
    reset,
    canSubmit,
    finalNote,
  };
}
