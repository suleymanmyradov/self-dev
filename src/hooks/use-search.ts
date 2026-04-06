import { useQuery } from '@tanstack/react-query';
import { search } from '@/api/search';
import type { SearchParams } from '@/api';

/**
 * Hook to search across content
 */
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => search(params),
    select: (data) => data.data,
    enabled: !!params.q && params.q.length > 0,
  });
}
