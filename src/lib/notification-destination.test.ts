import { describe, expect, it } from 'vitest';
import type { Notification } from '@/api/types';
import { notificationDestination } from './notification-destination';

const notification = (overrides: Partial<Notification>): Notification => ({
  id: 'notification-1',
  title: 'Title',
  message: 'Message',
  type: 'system',
  read: false,
  userId: 'user-1',
  createdAt: '2026-08-22T00:00:00Z',
  ...overrides,
});

describe('notificationDestination', () => {
  it('maps allowlisted destinations', () => {
    expect(notificationDestination(notification({ destination: 'weekly-review' }))).toBe('/progress');
    expect(notificationDestination(notification({ destination: 'habit-detail' }))).toBe('/habits');
  });

  it('requires resource ids for detail routes', () => {
    expect(notificationDestination(notification({ destination: 'article-detail' }))).toBeNull();
    expect(notificationDestination(notification({ destination: 'article-detail', resourceId: 'article-1' }))).toBe('/article/article-1');
  });

  it('rejects unknown destinations', () => {
    expect(notificationDestination(notification({ destination: 'https://example.com' }))).toBeNull();
  });
});
