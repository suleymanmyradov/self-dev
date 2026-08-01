import 'server-only';

import { serverGet, getServerAccessToken } from '@/lib/server-api';
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
  NotificationPreferencesResponseSchema,
  CoachingProfileResponseSchema,
  ProfileResponseSchema,
  ArticleResponseSchema,
  ConversationResponseSchema,
  ConversationsResponseSchema,
  MessagesResponseSchema,
  CategoriesResponseSchema,
  BillingOverviewResponseSchema,
  NotificationsResponseSchema,
  UnreadNotificationCountResponseSchema,
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
  NotificationPreferencesResponse,
  CoachingProfile,
  ProfileResponse,
  ArticleResponse,
  ConversationResponse,
  ConversationsResponse,
  MessagesResponse,
  CategoriesResponse,
  EntityType,
  BillingOverviewResponse,
  NotificationsResponse,
  UnreadNotificationCountResponse,
} from './types';

export async function listHabitsServer(params: PageParams = { page: 1, limit: 20 }): Promise<HabitsResponse> {
  const data = await serverGet<unknown>('/habits', params);
  return HabitsResponseSchema.parse(data);
}

// Fetch every habits page server-side so the SSR initial data is not truncated
// for users with >100 habits (the API caps `limit` at 100). The returned
// `page` metadata reflects the totals from the first page.
export async function listAllHabitsServer(): Promise<HabitsResponse> {
  const limit = 100;
  const first = await listHabitsServer({ page: 1, limit });
  if (first.data.length >= first.page.total) {
    return first;
  }
  const all = [...first.data];
  // Safety guard: cap pagination so an inconsistent `total`/`totalPages` from
  // the backend can never cause an unbounded loop.
  const maxPages = Math.min(first.page.totalPages, 100);
  for (let page = 2; page <= maxPages; page++) {
    const res = await listHabitsServer({ page, limit });
    all.push(...res.data);
    if (all.length >= first.page.total) break;
  }
  return { data: all, page: first.page };
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
  const data = await serverGet<unknown>('/activity', params);
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

export async function getNotificationPreferencesServer(): Promise<NotificationPreferencesResponse> {
  const data = await serverGet<unknown>('/notification-preferences');
  return NotificationPreferencesResponseSchema.parse(data);
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

export async function listCategoriesServer(entityType: EntityType): Promise<CategoriesResponse> {
  const data = await serverGet<unknown>('/categories', { entityType });
  return CategoriesResponseSchema.parse(data);
}

export async function listNotificationsServer(params: PageParams = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
  const data = await serverGet<unknown>('/notifications', params);
  return NotificationsResponseSchema.parse(data);
}

export async function getUnreadNotificationCountServer(): Promise<UnreadNotificationCountResponse> {
  const data = await serverGet<unknown>('/notifications/unread-count');
  return UnreadNotificationCountResponseSchema.parse(data);
}

/**
 * Fetch billing overview server-side for SSR initial data.
 *
 * Returns `null` when there is no auth cookie (unauthenticated users on the
 * public pricing page) so the caller can skip prefetch and let the client
 * query handle it after auth hydrates. Authenticated users get the full
 * overview, which is passed as `initialData` to `useBillingOverview` so the
 * plan cards render immediately without a client-side waterfall.
 */
export async function getBillingOverviewServer(): Promise<BillingOverviewResponse | null> {
  const token = await getServerAccessToken();
  if (!token) return null;
  try {
    const data = await serverGet<unknown>('/billing/overview');
    return BillingOverviewResponseSchema.parse(data);
  } catch (error) {
    // Re-throw Next.js redirect/notFound digests so the framework can handle them.
    if (
      error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_')
    ) {
      throw error;
    }
    // Swallow other errors (expired token, network) — the client-side query
    // will retry after auth hydrates, and the cards render with defaults.
    // Log in development so configuration/network issues are not silently hidden.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getBillingOverviewServer] non-Next.js error swallowed:', error);
    }
    return null;
  }
}
