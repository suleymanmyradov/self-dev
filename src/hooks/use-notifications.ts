import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/api/notifications';
import type { PageParams } from '@/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

const DEFAULT_NOTIFICATIONS_PARAMS: PageParams = { page: 1, limit: 20 };

export function useNotifications(params: PageParams = DEFAULT_NOTIFICATIONS_PARAMS) {
  const { page, limit } = params;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['notifications', page ?? 1, limit ?? 20],
    queryFn: () => listNotifications({ page, limit }),
    select: (data) => data.data,
    enabled: isAuthenticated,
    // Refresh the feed periodically so new notifications appear without a
    // manual reload. The dedicated unread-count query below drives the badge.
    refetchInterval: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Server-authoritative unread count. Uses the dedicated
 * /notifications/unread-count endpoint so the count is correct even when the
 * user has more than 100 notifications (the list endpoint caps at 100).
 * Returns a number (0 when unauthenticated, loading, or errored) so callers
 * can use it directly in comparisons and badges.
 */
export function useUnreadCount(): number {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadNotificationCount(),
    select: (d) => d.count,
    enabled: isAuthenticated,
    refetchInterval: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
  return data ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
}

