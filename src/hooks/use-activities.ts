import { useQuery } from '@tanstack/react-query';
import { listActivities } from '@/api';
import type { PageParams, ActivityResponse } from '@/api';

/**
 * Hook to fetch activities with pagination
 */
export function useActivities(params: PageParams = { page: 1, limit: 50 }, initialData?: ActivityResponse) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
    select: (data) => data.data,
    initialData,
    staleTime: 2 * 60 * 1000, // 2 minutes — mutations invalidate cache
  });
}
