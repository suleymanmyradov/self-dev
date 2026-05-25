import api from './client';
import type {
  ActivityResponse,
  PageParams,
} from './types';

const ENDPOINTS = {
  ACTIVITIES: '/activities',
};

/**
 * List activities with pagination
 */
export async function listActivities(params: PageParams = { page: 1, limit: 20 }): Promise<ActivityResponse> {
  return api.get<ActivityResponse>(ENDPOINTS.ACTIVITIES, params);
}
