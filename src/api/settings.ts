import api from './axios-client';
import {
  SettingsResponseSchema,
  UpdateSettingsRequestSchema,
} from '@/lib/validation';
import type {
  SettingsResponse,
  UpdateSettingsRequest,
} from './types';

const ENDPOINTS = {
  SETTINGS: '/settings',
};

/**
 * Get user settings
 */
export async function getSettings(): Promise<SettingsResponse> {
  const response = await api.get<unknown>(ENDPOINTS.SETTINGS);
  return SettingsResponseSchema.parse(response);
}

/**
 * Update user settings
 */
export async function updateSettings(data: UpdateSettingsRequest): Promise<SettingsResponse> {
  const validated = UpdateSettingsRequestSchema.parse(data);
  const response = await api.put<unknown>(ENDPOINTS.SETTINGS, validated);
  return SettingsResponseSchema.parse(response);
}
