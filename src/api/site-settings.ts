import api from './axios-client';
import { SiteSettingsResponseSchema } from '@/lib/validation';
import type { SiteSettingsResponse } from './types';

export async function listSiteSettings(): Promise<SiteSettingsResponse> {
  const response = await api.get<unknown>('/site-settings');
  return SiteSettingsResponseSchema.parse(response);
}
