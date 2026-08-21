import { useState, useCallback, useMemo } from 'react';
import type { CheckInStatus, CheckInMood, CheckInEnergy, CheckInBlocker, CheckIn } from '@/api';

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
    setForm({ ...initialState });
  }, []);

  // Pre-fill the form from an existing check-in (e.g. when reopening the
  // modal for a habit that was already checked in today). Strips the
  // "Blocker: ..." prefix that finalNote adds so the raw user note is
  // restored to the note field.
  const hydrate = useCallback((checkIn: CheckIn) => {
    let note = checkIn.note ?? '';
    let otherBlocker = '';
    const blocker = checkIn.blocker ?? null;
    if (note.startsWith('Blocker: ')) {
      const parts = note.split('\n\n', 2);
      otherBlocker = parts[0].replace('Blocker: ', '');
      note = parts[1] ?? '';
    }
    setForm({
      status: checkIn.status,
      mood: checkIn.mood ?? null,
      energy: checkIn.energy ?? null,
      blocker,
      otherBlocker,
      note,
    });
  }, []);

  // Only status is required — mood, energy, blocker, and note are all
  // optional. Not every habit has a meaningful "energy level" or "mood",
  // and users should be able to check in with just a note or nothing at all.
  const canSubmit = useMemo(() => Boolean(form.status), [form.status]);

  const finalNote = useMemo(() =>
    form.blocker === 'other' && form.otherBlocker.trim()
      ? `Blocker: ${form.otherBlocker.trim()}${form.note.trim() ? `\n\n${form.note.trim()}` : ''}`
      : form.note.trim(),
  [form.blocker, form.otherBlocker, form.note]);

  return {
    form,
    updateField,
    reset,
    hydrate,
    canSubmit,
    finalNote,
  };
}
