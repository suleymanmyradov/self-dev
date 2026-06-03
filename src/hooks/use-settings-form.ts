import { useState, useCallback, useRef } from 'react';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/api';
import { toast } from '@/components/ui/sonner';
import type { Profile } from '@/api';

const accountSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.string().email('Invalid email address'),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export function useSettingsForm(initialProfile?: Profile) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AccountFormData>({
    username: initialProfile?.username ?? '',
    email: initialProfile?.email ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when the underlying profile identity changes
  const prevIdRef = useRef(initialProfile?.id);
  if (initialProfile?.id !== prevIdRef.current) {
    prevIdRef.current = initialProfile?.id;
    if (initialProfile) {
      setFormData({
        username: initialProfile.username,
        email: initialProfile.email,
      });
      setErrors({});
    }
  }

  const updateField = useCallback(
    (field: keyof AccountFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    },
    []
  );

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const result = accountSchema.safeParse({
      username: formData.username.trim(),
      email: formData.email.trim(),
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AccountFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof AccountFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setSaving(true);
    const payload = result.data;

    try {
      await updateProfile({
        fullName: payload.username,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Settings saved successfully');
      return true;
    } catch {
      toast.error('Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, queryClient]);

  return {
    formData,
    errors,
    saving,
    updateField,
    handleSave,
    setFormData,
  };
}
