import 'server-only';

import { serverGet } from '@/lib/server-api';
import {
  HabitsResponseSchema,
  CheckInsResponseSchema,
  GoalsResponseSchema,
  ActivityResponseSchema,
  SavedItemsDetailedResponseSchema,
  WeeklyReviewResponseSchema,
  WeeklyReviewsResponseSchema,
  ArticlesResponseSchema,
  SettingsResponseSchema,
  CoachingProfileResponseSchema,
  ProfileResponseSchema,
  ArticleResponseSchema,
  ConversationResponseSchema,
  ConversationsResponseSchema,
  MessagesResponseSchema,
} from '@/lib/validation';
import type {
  PageParams,
  HabitsResponse,
  CheckInsResponse,
  GoalsResponse,
  ActivityResponse,
  SavedItemsDetailedResponse,
  ApiResponse,
  WeeklyReview,
  ArticlesResponse,
  SettingsResponse,
  CoachingProfile,
  ProfileResponse,
  ArticleResponse,
  ConversationResponse,
  ConversationsResponse,
  MessagesResponse,
} from './types';

export async function listHabitsServer(params: PageParams = { page: 1, limit: 20 }): Promise<HabitsResponse> {
  const data = await serverGet<unknown>('/habits', params);
  return HabitsResponseSchema.parse(data);
}

export async function getTodayCheckInsServer(params: PageParams = { page: 1, limit: 20 }): Promise<CheckInsResponse> {
  const data = await serverGet<unknown>('/check-ins/today', params);
  return CheckInsResponseSchema.parse(data);
}

export async function listGoalsServer(params: PageParams = { page: 1, limit: 20 }): Promise<GoalsResponse> {
  const data = await serverGet<unknown>('/goals', params);
  return GoalsResponseSchema.parse(data);
}

export async function listActivitiesServer(params: PageParams = { page: 1, limit: 50 }): Promise<ActivityResponse> {
  const data = await serverGet<unknown>('/activities', params);
  return ActivityResponseSchema.parse(data);
}

export async function listSavedDetailedServer(params: PageParams = { page: 1, limit: 100 }): Promise<SavedItemsDetailedResponse> {
  const data = await serverGet<unknown>('/saved/detailed', params);
  return SavedItemsDetailedResponseSchema.parse(data);
}

export async function getCurrentWeeklyReviewServer(): Promise<ApiResponse<WeeklyReview>> {
  const data = await serverGet<unknown>('/weekly-reviews/current');
  return WeeklyReviewResponseSchema.parse(data);
}

export async function listWeeklyReviewsServer(params: PageParams = { page: 1, limit: 10 }): Promise<ApiResponse<WeeklyReview[]>> {
  const data = await serverGet<unknown>('/weekly-reviews', params);
  return WeeklyReviewsResponseSchema.parse(data);
}

export async function listArticlesServer(params: { limit?: number; category?: string } = { limit: 20 }): Promise<ArticlesResponse> {
  const data = await serverGet<unknown>('/articles', params);
  return ArticlesResponseSchema.parse(data);
}

export async function getSettingsServer(): Promise<SettingsResponse> {
  const data = await serverGet<unknown>('/settings');
  return SettingsResponseSchema.parse(data);
}

export async function getCoachingProfileServer(): Promise<CoachingProfile> {
  const data = await serverGet<unknown>('/personalization/coaching-profile');
  return CoachingProfileResponseSchema.parse(data).data;
}

export async function getCurrentUserServer(): Promise<ProfileResponse> {
  const data = await serverGet<unknown>('/profile/me');
  return ProfileResponseSchema.parse(data);
}

export async function getArticleServer(id: string): Promise<ArticleResponse> {
  const data = await serverGet<unknown>(`/articles/${encodeURIComponent(id)}`);
  return ArticleResponseSchema.parse(data);
}

export async function getConversationServer(id: string): Promise<ConversationResponse> {
  const data = await serverGet<unknown>(`/conversations/${encodeURIComponent(id)}`);
  return ConversationResponseSchema.parse(data);
}

export async function getMessagesServer(conversationId: string, params: PageParams = { page: 1, limit: 50 }): Promise<MessagesResponse> {
  const data = await serverGet<unknown>(`/conversations/${encodeURIComponent(conversationId)}/messages`, params);
  return MessagesResponseSchema.parse(data);
}

export async function listConversationsServer(params: PageParams = { page: 1, limit: 20 }): Promise<ConversationsResponse> {
  const data = await serverGet<unknown>('/conversations', params);
  return ConversationsResponseSchema.parse(data);
}
