import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '@/api/notifications';
import type { PageParams } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

const DEFAULT_NOTIFICATIONS_PARAMS: PageParams = { page: 1, limit: 20 };

export function useNotifications(params: PageParams = DEFAULT_NOTIFICATIONS_PARAMS) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['notifications', page ?? 1, limit ?? 20],
    queryFn: () => listNotifications({ page, limit }),
    select: (data) => data.data,
  });
}

const UNREAD_COUNT_PARAMS: PageParams = { page: 1, limit: 100 };

export function useUnreadCount() {
  const { data: notifications } = useNotifications(UNREAD_COUNT_PARAMS);
  return useMemo(() => notifications?.filter((n) => !n.read).length ?? 0, [notifications]);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: handleMutationError,
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
    onError: handleMutationError,
  });
}
