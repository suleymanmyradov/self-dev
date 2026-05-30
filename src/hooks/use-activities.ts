import { useQuery } from '@tanstack/react-query';
import { listActivities } from '@/api';
import type { ActivityResponse, PageParams } from '@/api';

export function useActivities(params: PageParams = { page: 1, limit: 20 }, initialData?: ActivityResponse) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
    select: (data) => data.data,
    initialData,
  });
}
