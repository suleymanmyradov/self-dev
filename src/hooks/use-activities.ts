import { useQuery } from '@tanstack/react-query';
import { listActivities } from '@/api';
import type { ActivityResponse, PageParams } from '@/api';

const DEFAULT_ACTIVITIES_PARAMS: PageParams = { page: 1, limit: 20 };

export function useActivities(params: PageParams = DEFAULT_ACTIVITIES_PARAMS, initialData?: ActivityResponse) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => listActivities(params),
    select: (data) => data.data,
    initialData,
  });
}
