import api from './client';
import type {
  Notification,
  NotificationsResponse,
  PageParams,
} from './types';

const ENDPOINTS = {
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',
};

/**
 * List notifications with pagination
 */
export async function listNotifications(params: PageParams = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
  return api.get<NotificationsResponse>(ENDPOINTS.NOTIFICATIONS, params);
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(id: string): Promise<void> {
  return api.put(ENDPOINTS.NOTIFICATION_READ(id));
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  return api.put(ENDPOINTS.NOTIFICATIONS_READ_ALL);
}
