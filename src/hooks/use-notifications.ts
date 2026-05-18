import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/notifications';
import type { PageParams } from '@/api';

/**
 * Hook to fetch notifications
 */
export function useNotifications(params: PageParams = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => listNotifications(params),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch unread notification count (lightweight polling).
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const data = await listNotifications({ page: 1, limit: 1 });
      // The API doesn't have a dedicated unread-count endpoint yet,
      // so we derive it from the first page of notifications.
      return (data.data ?? []).filter((n) => !n.read).length;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
