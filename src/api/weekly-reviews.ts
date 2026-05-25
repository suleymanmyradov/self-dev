import api from './client';
import type { ApiResponse, PageParams, WeeklyReview } from './types';

const ENDPOINTS = {
  WEEKLY_REVIEWS: '/weekly-reviews',
  CURRENT: '/weekly-reviews/current',
  GENERATE: '/weekly-reviews/generate',
};

export async function generateWeeklyReview(data?: { weekStart?: string; forceRegenerate?: boolean }): Promise<ApiResponse<WeeklyReview>> {
  return api.post(ENDPOINTS.GENERATE, data ?? {});
}

export async function getCurrentWeeklyReview(): Promise<ApiResponse<WeeklyReview>> {
  return api.get(ENDPOINTS.CURRENT);
}

export async function getWeeklyReview(weekStart: string): Promise<ApiResponse<WeeklyReview>> {
  return api.get(`${ENDPOINTS.WEEKLY_REVIEWS}/${weekStart}`);
}

export async function listWeeklyReviews(params: PageParams): Promise<ApiResponse<WeeklyReview[]>> {
  return api.get(ENDPOINTS.WEEKLY_REVIEWS, params);
}
