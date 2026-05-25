import api from './client';
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
  return api.get<SettingsResponse>(ENDPOINTS.SETTINGS);
}

/**
 * Update user settings
 */
export async function updateSettings(data: UpdateSettingsRequest): Promise<SettingsResponse> {
  return api.put<SettingsResponse>(ENDPOINTS.SETTINGS, data);
}
