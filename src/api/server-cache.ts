import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { gatewayUrl } from '@/lib/config';
import {
  ArticlesResponseSchema,
  ArticleResponseSchema,
  CategoriesResponseSchema,
} from '@/lib/validation';
import type {
  ArticlesResponse,
  ArticleResponse,
  CategoriesResponse,
  EntityType,
} from './types';

// =============================================================================
// Cached public-content fetchers
//
// These functions use the "use cache" directive to cache PUBLIC content that is
// identical for all users (articles and categories). They make UNAUTHENTICATED
// requests directly to the gateway — they must NOT call cookies() or any other
// request-time API, because "use cache" functions execute in an isolated scope
// that cannot access per-request data.
//
// Per-user fields like isLiked/isSaved are NOT populated by these cached
// fetches; client components (ArticleLikeWrapper, ArticleSaveWrapper) handle
// those interactively on the client side.
//
// To invalidate cached data on-demand, call revalidateTag with the appropriate
// tag (e.g. revalidateTag('articles', 'max')) from a Server Action or Route
// Handler.
// =============================================================================

/**
 * Fetch a paginated list of published articles with `use cache`.
 *
 * Cached under the `'articles'` tag so all article-list cache entries can be
 * invalidated together via `revalidateTag('articles', 'max')`.
 *
 * @example
 * // Invalidate after a new article is published:
 * revalidateTag('articles', 'max');
 */
export async function listArticlesCached(
  params: { limit?: number; category?: string } = { limit: 20 },
): Promise<ArticlesResponse> {
  'use cache';
  cacheLife('hours');
  cacheTag('articles');

  const url = gatewayUrl('/articles');
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);

  const response = await fetch(`${url}?${searchParams.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] listArticlesCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return ArticlesResponseSchema.parse(data);
}

/**
 * Fetch a single article by ID with `use cache`.
 *
 * Cached under both `'article:${id}'` (for per-article invalidation) and
 * `'articles'` (for bulk invalidation). Use `revalidateTag('article:${id}', 'max')`
 * to invalidate a specific article after it is edited.
 */
export async function getArticleCached(id: string): Promise<ArticleResponse> {
  'use cache';
  cacheLife('hours');
  cacheTag(`article:${id}`, 'articles');

  const url = gatewayUrl(`/articles/${encodeURIComponent(id)}`);
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] getArticleCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return ArticleResponseSchema.parse(data);
}

/**
 * Fetch categories for a given entity type with `use cache`.
 *
 * Cached under the `'categories'` tag. Categories change infrequently, so the
 * `'days'` cache profile is used (revalidates daily).
 */
export async function listCategoriesCached(entityType: EntityType): Promise<CategoriesResponse> {
  'use cache';
  cacheLife('days');
  cacheTag('categories');

  const url = gatewayUrl('/categories');
  const searchParams = new URLSearchParams({ entityType });
  const response = await fetch(`${url}?${searchParams.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] listCategoriesCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return CategoriesResponseSchema.parse(data);
}
