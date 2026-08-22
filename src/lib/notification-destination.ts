import type { Notification } from '@/api/types';

export function notificationDestination(notification: Notification): string | null {
  switch (notification.destination) {
    case 'weekly-review':
    case 'activity':
      return '/progress';
    case 'habit-detail':
      return '/habits';
    case 'goal-detail':
      return '/goals';
    case 'article-detail':
      return notification.resourceId ? `/article/${encodeURIComponent(notification.resourceId)}` : null;
    case 'conversation':
      return notification.resourceId ? `/coach/${encodeURIComponent(notification.resourceId)}` : null;
    default:
      return null;
  }
}
