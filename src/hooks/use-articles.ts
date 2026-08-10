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
    // Refetch on mount so per-user fields (isLiked, isSaved) are correct.
    // The SSR initialData comes from an unauthenticated cached fetch, so
    // user-specific fields are always false from the server; the background
    // refetch with the auth cookie updates them.
    staleTime: 0,
  });
}
