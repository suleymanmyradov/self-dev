import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { gatewayUrl } from '@/lib/config';
import {
  ArticlesResponseSchema,
  ArticleResponseSchema,
  CategoriesResponseSchema,
  SiteSettingsResponseSchema,
  HabitTemplatesResponseSchema,
  GoalTemplatesResponseSchema,
} from '@/lib/validation';
import type {
  ArticlesResponse,
  ArticleResponse,
  CategoriesResponse,
  EntityType,
  SiteSettingsResponse,
  ExploreSettings,
  ExploreHeaderSetting,
  CommunityCardSetting,
  HabitTemplatesResponse,
  GoalTemplatesResponse,
  HabitTemplateItem,
  GoalTemplateItem,
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
 * Fetch the featured (most popular) article with `use cache`.
 *
 * The featured article is derived from engagement metrics (likes, saves, shares)
 * and is cached under the `'articles'` tag so it revalidates with other article
 * caches. Returns `null` when no featured article is available.
 */
export async function getFeaturedArticleCached(): Promise<ArticleResponse | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('articles');

  const url = gatewayUrl('/articles/featured');
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] getFeaturedArticleCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  const parsed = ArticleResponseSchema.parse(data);
  // Gateway returns empty data when no featured article exists.
  return parsed.data ? parsed : null;
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

/**
 * Fetch all site settings with `use cache`.
 *
 * Cached under the `'site-settings'` tag. Settings change infrequently, so the
 * `'days'` cache profile is used.
 */
export async function listSiteSettingsCached(): Promise<SiteSettingsResponse> {
  'use cache';
  cacheLife('days');
  cacheTag('site-settings');

  const url = gatewayUrl('/site-settings');
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] listSiteSettingsCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return SiteSettingsResponseSchema.parse(data);
}

// =============================================================================
// Explore settings helpers — parse the raw key/value settings into typed
// objects the explore page can consume. Falls back to hardcoded defaults so
// the explore page never breaks if settings are missing or malformed.
// =============================================================================

const DEFAULT_EXPLORE_HEADER: ExploreHeaderSetting = {
  title: 'Explore',
  subtitle: 'Discover content to inspire your growth journey.',
};

const DEFAULT_EXPLORE_TABS = ['articles', 'habits', 'goals', 'community'];

const DEFAULT_COMMUNITY_CARD: CommunityCardSetting = {
  title: 'Connect with the Community',
  description: 'Join others on their growth journey. Share insights, get support, and stay motivated.',
  discordUrl: 'https://discord.com/invite/your-server',
  xUrl: 'https://x.com/your-handle',
};

/**
 * Parse the raw site settings response into a typed `ExploreSettings` object.
 * Falls back to defaults for any missing or malformed keys.
 */
export function parseExploreSettings(settings: SiteSettingsResponse): ExploreSettings {
  const byKey = new Map(settings.data.map((s) => [s.key, s.value]));

  let header = DEFAULT_EXPLORE_HEADER;
  const headerRaw = byKey.get('explore.header');
  if (headerRaw) {
    try {
      const parsed = JSON.parse(headerRaw) as Partial<ExploreHeaderSetting>;
      header = {
        title: typeof parsed.title === 'string' ? parsed.title : DEFAULT_EXPLORE_HEADER.title,
        subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : DEFAULT_EXPLORE_HEADER.subtitle,
      };
    } catch {
      // keep default
    }
  }

  let tabs = DEFAULT_EXPLORE_TABS;
  const tabsRaw = byKey.get('explore.tabs');
  if (tabsRaw) {
    try {
      const parsed = JSON.parse(tabsRaw);
      if (Array.isArray(parsed) && parsed.every((t) => typeof t === 'string') && parsed.length > 0) {
        tabs = parsed as string[];
      }
    } catch {
      // keep default
    }
  }

  let community = DEFAULT_COMMUNITY_CARD;
  const communityRaw = byKey.get('community.card');
  if (communityRaw) {
    try {
      const parsed = JSON.parse(communityRaw) as Partial<CommunityCardSetting>;
      community = {
        title: typeof parsed.title === 'string' ? parsed.title : DEFAULT_COMMUNITY_CARD.title,
        description: typeof parsed.description === 'string' ? parsed.description : DEFAULT_COMMUNITY_CARD.description,
        discordUrl: typeof parsed.discordUrl === 'string' ? parsed.discordUrl : DEFAULT_COMMUNITY_CARD.discordUrl,
        xUrl: typeof parsed.xUrl === 'string' ? parsed.xUrl : DEFAULT_COMMUNITY_CARD.xUrl,
      };
    } catch {
      // keep default
    }
  }

  return { header, tabs, community };
}

/**
 * Fetch and parse site settings for the explore page in one call.
 * Returns defaults on error so the explore page never breaks.
 */
export async function getExploreSettingsCached(): Promise<ExploreSettings> {
  try {
    const settings = await listSiteSettingsCached();
    return parseExploreSettings(settings);
  } catch {
    return {
      header: DEFAULT_EXPLORE_HEADER,
      tabs: DEFAULT_EXPLORE_TABS,
      community: DEFAULT_COMMUNITY_CARD,
    };
  }
}

// =============================================================================
// Template fetchers — habit & goal suggestion library for the explore page.
// =============================================================================

/**
 * Fetch active habit templates with `use cache`.
 * Cached under the `'habit-templates'` tag.
 */
export async function listHabitTemplatesCached(): Promise<HabitTemplatesResponse> {
  'use cache';
  cacheLife('hours');
  cacheTag('habit-templates');

  const url = gatewayUrl('/habit-templates');
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] listHabitTemplatesCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return HabitTemplatesResponseSchema.parse(data);
}

/**
 * Fetch active goal templates with `use cache`.
 * Cached under the `'goal-templates'` tag.
 */
export async function listGoalTemplatesCached(): Promise<GoalTemplatesResponse> {
  'use cache';
  cacheLife('hours');
  cacheTag('goal-templates');

  const url = gatewayUrl('/goal-templates');
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`[server-cache] listGoalTemplatesCached failed: ${response.status}`);
  }
  const data: unknown = await response.json();
  return GoalTemplatesResponseSchema.parse(data);
}

/**
 * Fetch both habit and goal templates in parallel.
 * Returns empty arrays on error so the explore page never breaks.
 */
export async function getExploreTemplatesCached(): Promise<{
  habits: HabitTemplateItem[];
  goals: GoalTemplateItem[];
}> {
  const [habitsResp, goalsResp] = await Promise.all([
    listHabitTemplatesCached().catch(() => null),
    listGoalTemplatesCached().catch(() => null),
  ]);
  return {
    habits: habitsResp?.data ?? [],
    goals: goalsResp?.data ?? [],
  };
}
