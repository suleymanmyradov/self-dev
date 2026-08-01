import api from './axios-client';
import { ActivityResponseSchema } from '@/lib/validation';
import type { ActivityResponse, PageParams } from './types';

const ENDPOINTS = {
  ACTIVITIES: '/activity',
};

export async function listActivities(params: PageParams = { page: 1, limit: 20 }): Promise<ActivityResponse> {
  const response = await api.get<unknown>(ENDPOINTS.ACTIVITIES, params);
  return ActivityResponseSchema.parse(response);
}
