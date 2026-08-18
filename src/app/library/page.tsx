import { Suspense } from 'react';
import { connection } from 'next/server';
import { ExploreClient } from '@/components/explore/explore-client';
import {
  listArticlesCached,
  listCategoriesCached,
  getExploreSettingsCached,
  getFeaturedArticleCached,
  getExploreTemplatesCached,
} from '@/api/server-cache';
import { swallowOptional } from '@/lib/server-data';
import { ExploreSkeleton } from '@/components/explore/explore-skeleton';
import type { Article, CategoriesResponse, HabitTemplateItem, GoalTemplateItem } from '@/api';
import type { HabitTemplate, GoalTemplate } from '@/types/explore';

// Skip prerendering when the gateway is not reachable at build time.
// Set SKIP_ARTICLE_PRERENDER=1 in CI/build environments without backend access.
// Default (unset): the page fetches at build time and fails loudly if the API
// is down — a silent empty library in production is worse than a loud build.
const SKIP_PRERENDER = process.env.SKIP_ARTICLE_PRERENDER === '1';

function mapHabitTemplate(t: HabitTemplateItem): HabitTemplate {
  return {
    name: t.name,
    description: t.description,
    category: t.category?.slug ?? '',
  };
}

function mapGoalTemplate(t: GoalTemplateItem): GoalTemplate {
  return {
    title: t.title,
    description: t.description,
    category: t.category?.slug ?? '',
    progress: 0,
  };
}

export default async function ExplorePage() {
  if (SKIP_PRERENDER) {
    await connection();
  }

  const articlesPromise = listArticlesCached({ limit: 20 });
  // Category chips are driven by the DB categories table so the filter list
  // stays in sync with what articles are actually tagged with. Non-critical —
  // the client falls back to "All" only if the fetch fails.
  const categoriesPromise = swallowOptional(
    listCategoriesCached('article'),
    { data: [] } as CategoriesResponse,
  );
  const [settings, featuredArticleResp, templates] = await Promise.all([
    getExploreSettingsCached(),
    getFeaturedArticleCached().catch(() => null),
    getExploreTemplatesCached(),
  ]);

  const featuredArticle: Article | null = featuredArticleResp?.data ?? null;
  const habitTemplates = templates.habits.map(mapHabitTemplate);
  const goalTemplates = templates.goals.map(mapGoalTemplate);

  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreClient
        articlesPromise={articlesPromise}
        categoriesPromise={categoriesPromise}
        settings={settings}
        featuredArticle={featuredArticle}
        habitTemplates={habitTemplates}
        goalTemplates={goalTemplates}
      />
    </Suspense>
  );
}
