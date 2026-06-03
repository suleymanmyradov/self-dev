import { useQuery } from '@tanstack/react-query';
import { listArticles } from '@/api';
import type { ArticlesResponse, ListArticlesParams } from '@/api';

export function useArticles(params?: ListArticlesParams, initialData?: ArticlesResponse) {
  const category = params?.category;
  const page = params?.page;
  const limit = params?.limit;
  return useQuery({
    queryKey: ['articles', category ?? 'all', page ?? 1, limit ?? 20],
    queryFn: () => listArticles({ category, page, limit }),
    select: (data) => data.data,
    initialData,
  });
}
