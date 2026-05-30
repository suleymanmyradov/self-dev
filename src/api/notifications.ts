import api from './axios-client';
import { NotificationsResponseSchema } from '@/lib/validation';
import type {
  NotificationsResponse,
  PageParams,
} from './types';

const ENDPOINTS = {
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
};

/**
 * List notifications with pagination
 */
export async function listNotifications(params: PageParams = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
  const response = await api.get<unknown>(ENDPOINTS.NOTIFICATIONS, params);
  return NotificationsResponseSchema.parse(response);
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(id: string): Promise<void> {
  await api.put(ENDPOINTS.NOTIFICATION_READ(id));
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  await api.put(ENDPOINTS.NOTIFICATIONS_READ_ALL);
}
