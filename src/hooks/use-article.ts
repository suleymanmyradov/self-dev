import { useQuery } from '@tanstack/react-query';
import { getArticle } from '@/api';
import type { ArticleResponse } from '@/api';

/**
 * Fetch a single article client-side with authentication.
 *
 * The server-side `getArticleCached` fetch is intentionally unauthenticated
 * (for caching public content), so per-user fields like `isLiked`/`isSaved`
 * are always `false` from the server. This hook refetches with the user's auth
 * context so those fields are correct. Pass the server-fetched response as
 * `initialData` to avoid a loading flash on first render.
 *
 * `staleTime: 0` ensures the query refetches on mount so the authenticated
 * `isLiked` state is always fresh.
 */
export function useArticle(articleId: string, initialData?: ArticleResponse) {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticle(articleId),
    select: (data) => data.data,
    initialData,
    staleTime: 0,
  });
}
