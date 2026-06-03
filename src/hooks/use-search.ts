import { useQuery } from '@tanstack/react-query';
import { search } from '@/api';
import type { SearchParams } from '@/api';

export function useSearch(params: SearchParams) {
  const { q, type, page, limit } = params;
  return useQuery({
    queryKey: ['search', q, type, page ?? 1, limit ?? 20],
    queryFn: () => search({ q, type, page, limit }),
    select: (data) => data.data,
    enabled: !!q && q.length > 0,
  });
}
