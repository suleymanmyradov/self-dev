import { useQuery } from '@tanstack/react-query';
import { listActivities } from '@/api';
import type { ActivityResponse, PageParams } from '@/api';

const DEFAULT_ACTIVITIES_PARAMS: PageParams = { page: 1, limit: 20 };

export function useActivities(params: PageParams = DEFAULT_ACTIVITIES_PARAMS, initialData?: ActivityResponse) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['activities', page ?? 1, limit ?? 20],
    queryFn: () => listActivities({ page, limit }),
    select: (data) => data.data,
    initialData,
  });
}
