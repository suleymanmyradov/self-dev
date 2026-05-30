import api from './axios-client';
import {
  WeeklyReviewResponseSchema,
  WeeklyReviewsResponseSchema,
} from '@/lib/validation';
import type { ApiResponse, PageParams, WeeklyReview } from './types';

const ENDPOINTS = {
  WEEKLY_REVIEWS: '/weekly-reviews',
  CURRENT: '/weekly-reviews/current',
  GENERATE: '/weekly-reviews/generate',
};

export async function generateWeeklyReview(data?: { weekStart?: string; forceRegenerate?: boolean }): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.post<unknown>(ENDPOINTS.GENERATE, data ?? {});
  return WeeklyReviewResponseSchema.parse(response);
}

export async function getCurrentWeeklyReview(): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.get<unknown>(ENDPOINTS.CURRENT);
  return WeeklyReviewResponseSchema.parse(response);
}

export async function getWeeklyReview(weekStart: string): Promise<ApiResponse<WeeklyReview>> {
  const response = await api.get<unknown>(`${ENDPOINTS.WEEKLY_REVIEWS}/${encodeURIComponent(weekStart)}`);
  return WeeklyReviewResponseSchema.parse(response);
}

export async function listWeeklyReviews(params: PageParams): Promise<ApiResponse<WeeklyReview[]>> {
  const response = await api.get<unknown>(ENDPOINTS.WEEKLY_REVIEWS, params);
  return WeeklyReviewsResponseSchema.parse(response);
}
