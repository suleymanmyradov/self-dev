import { useQuery } from '@tanstack/react-query';
import { listActivities } from '@/api';
import type { PageParams } from '@/api';

/**
 * Hook to fetch activities with pagination
 */
export function useActivities(params: PageParams = { page: 1, limit: 50 }) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
    select: (data) => data.data,
  });
}
