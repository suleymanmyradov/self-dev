import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import type { Profile, UpdateProfileRequest } from '@/api';
import { updateProfile } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';

const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_\.\-]+$/i, 'Letters, numbers, dot, hyphen, underscore only'),
  bio: z.string().max(280, 'Max 280 characters').optional().default(''),
  location: z.string().max(60).optional().default(''),
  website: z
    .string()
    .url('Must be a valid URL')
    .or(z.string().length(0))
    .optional()
    .default(''),
  interests: z
    .string()
    .optional()
    .default('')
    .transform((s) => s?.split(',').map((v) => v.trim()).filter(Boolean) ?? []),
  avatarUrl: z
    .string()
    .url('Must be a valid image URL')
    .or(z.string().length(0))
    .optional()
    .default(''),
});

export type ProfileFormState = {
  fullName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  interests: string;
  avatarUrl: string;
};

const toFormState = (profile?: Partial<Profile>): ProfileFormState => ({
  fullName: profile?.fullName ?? '',
  username: profile?.username ?? '',
  bio: profile?.bio ?? '',
  location: profile?.location ?? '',
  website: profile?.website ?? '',
  interests: (profile?.interests ?? []).join(', '),
  avatarUrl: profile?.avatarUrl ?? '',
});

export function useProfileForm(initialProfile?: Profile) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileFormState>(toFormState(initialProfile));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(toFormState(initialProfile));
  }, [initialProfile?.id]);

  const handleChange = useCallback(
    (field: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    const parsed = ProfileSchema.safeParse({ ...form });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return false;
    }

    setSaving(true);
    const data = parsed.data;
    const payload: UpdateProfileRequest = {
      fullName: data.fullName.trim(),
      bio: (form.bio || '').trim(),
      location: (form.location || '').trim(),
      website: (form.website || '').trim(),
      interests: data.interests as string[],
      avatarUrl: (form.avatarUrl || '').trim(),
    };

    try {
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      return true;
    } catch {
      toast.error('Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, queryClient]);

  return {
    form,
    error,
    saving,
    handleChange,
    handleSubmit,
    setForm,
  };
}
