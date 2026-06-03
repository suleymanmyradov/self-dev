'use server';

import { revalidatePath } from 'next/cache';
import { serverPut, serverPatch } from '@/lib/server-api';
import {
  UpdateProfileRequestSchema,
  UpdateSettingsRequestSchema,
  UpdateCoachingProfilePreferencesRequestSchema,
} from '@/lib/validation';
import type {
  UpdateProfileRequest,
  UpdateSettingsRequest,
  UpdateCoachingProfilePreferencesRequest,
} from '@/api/types';

export interface ActionState {
  success: boolean;
  error?: string;
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const raw: UpdateProfileRequest = {
      fullName: (formData.get('fullName') as string) || undefined,
      bio: (formData.get('bio') as string) || undefined,
      location: (formData.get('location') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      interests: (formData.get('interests') as string)
        ?.split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      avatarUrl: (formData.get('avatarUrl') as string) || undefined,
    };

    const validated = UpdateProfileRequestSchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(', '),
      };
    }

    await serverPut('/profile', validated.data);
    revalidatePath('/profile');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, error: message };
  }
}

export async function updateSettingsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const raw: UpdateSettingsRequest = {};

    const emailNotifications = formData.get('emailNotifications');
    if (emailNotifications !== null) {
      raw.emailNotifications = emailNotifications === 'true';
    }

    const pushNotifications = formData.get('pushNotifications');
    if (pushNotifications !== null) {
      raw.pushNotifications = pushNotifications === 'true';
    }

    const habitReminders = formData.get('habitReminders');
    if (habitReminders !== null) {
      raw.habitReminders = habitReminders === 'true';
    }

    const goalReminders = formData.get('goalReminders');
    if (goalReminders !== null) {
      raw.goalReminders = goalReminders === 'true';
    }

    const theme = formData.get('theme') as string;
    if (theme) raw.theme = theme as 'light' | 'dark' | 'system';

    const language = formData.get('language') as string;
    if (language) raw.language = language;

    const timezone = formData.get('timezone') as string;
    if (timezone) raw.timezone = timezone;

    const accountabilityStyle = formData.get('accountabilityStyle') as string;
    if (accountabilityStyle) {
      raw.accountabilityStyle = accountabilityStyle as 'gentle' | 'balanced' | 'strict';
    }

    const checkInTime = formData.get('checkInTime') as string;
    if (checkInTime) raw.checkInTime = checkInTime;

    const validated = UpdateSettingsRequestSchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(', '),
      };
    }

    await serverPatch('/settings', validated.data);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update settings';
    return { success: false, error: message };
  }
}

export async function updateCoachingPreferencesAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const raw: UpdateCoachingProfilePreferencesRequest = {
      accountabilityStyle: formData.get('accountabilityStyle') as 'gentle' | 'balanced' | 'strict',
      preferredTone: formData.get('preferredTone') as 'supportive' | 'direct' | 'warm' | 'practical' | 'challenging',
      difficultyPreference: formData.get('difficultyPreference') as 'easy' | 'adaptive' | 'ambitious',
    };

    const validated = UpdateCoachingProfilePreferencesRequestSchema.safeParse(raw);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(', '),
      };
    }

    await serverPatch('/personalization/coaching-profile/preferences', validated.data);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update coaching preferences';
    return { success: false, error: message };
  }
}
