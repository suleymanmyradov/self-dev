import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getArticleCached } from "@/api/server-cache";
import { listArticles } from "@/api";
import { RelativeTime } from "@/components/shared/relative-time";
import { ArticleMarkdown, ReadingProgress } from "@/components/article/article-markdown";
import { Button } from "@/components/ui/button";
import ArticleSaveWrapper from "./article-save-wrapper";
import ArticleLikeWrapper from "./article-like-wrapper";
import { ChevronLeft, Plus } from "lucide-react";
import ArticleShareButton from "./article-share-button";

// =============================================================================
// Env-gated prerendering
//
// By default, generateStaticParams fetches real article IDs from the gateway
// and the build fails loudly if the API is unreachable — this is intentional:
// a production build with zero prerendered articles is a misconfiguration you
// want to catch. Set SKIP_ARTICLE_PRERENDER=1 in CI/build environments where
// the gateway is not reachable; the route renders dynamically at request time
// instead of being prerendered at build time.
// =============================================================================

const SKIP_PRERENDER = process.env.SKIP_ARTICLE_PRERENDER === '1';

// =============================================================================
// Shared server fetch with React cache — dedupes across generateMetadata + page
// =============================================================================

const fetchArticle = cache(async (id: string) => {
  // Skip the sentinel param from generateStaticParams (SKIP_ARTICLE_PRERENDER).
  if (id === 'skip-prerender') return null;
  try {
    return await getArticleCached(id);
  } catch (error) {
    console.error(`[ArticlePage] Failed to fetch article ${id}:`, error);
    return null;
  }
});

// =============================================================================
// Static generation for popular articles
// =============================================================================

export async function generateStaticParams() {
  if (SKIP_PRERENDER) {
    // cacheComponents requires at least one param. Return a sentinel that
    // the page body renders as notFound(). This is opt-in via env flag only;
    // the default path below fails loudly if the gateway is unreachable.
    return [{ id: 'skip-prerender' }];
  }
  // Default: fetch real article IDs. If the gateway is unreachable, this
  // throws and the build fails loudly — a production build with zero
  // prerendered articles is a misconfiguration worth catching.
  const response = await listArticles({ limit: 50 });
  return (response.data ?? []).map((article) => ({ id: article.id }));
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const response = await fetchArticle(id);
  const article = response?.data;

  return {
    title: article ? `${article.title} | Growth` : "Article | Growth",
    description: article?.excerpt ?? "Read this article on Growth.",
  };
}

// =============================================================================
// Component
// =============================================================================

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // The skip-prerender sentinel from generateStaticParams is not a real
  // article — render notFound(). Real article IDs are served at request time.
  if (id === 'skip-prerender') {
    notFound();
  }

  // Fetch the article and the list (for the "next" sidebar link) in parallel.
  const [response, articlesResponse] = await Promise.all([
    fetchArticle(id),
    listArticles({ limit: 20 }).catch(() => null),
  ]);
  const article = response?.data;

  if (!article) return notFound();

  // Pick the next article for the sidebar from the already-fetched list.
  let nextArticle: { id: string; title: string; category?: { name: string } } | null = null;
  const allArticles = articlesResponse?.data ?? [];
  const currentIndex = allArticles.findIndex((a) => a.id === id);
  if (currentIndex >= 0 && currentIndex < allArticles.length - 1) {
    const next = allArticles[currentIndex + 1];
    nextArticle = { id: next.id, title: next.title, category: next.category };
  } else if (allArticles.length > 0 && allArticles[0].id !== id) {
    const next = allArticles[0];
    nextArticle = { id: next.id, title: next.title, category: next.category };
  }

  const categoryName = article.category?.name;

  return (
    <>
      {/* Reading progress bar */}
      <ReadingProgress />

      <div className="h-full flex flex-col relative">
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* Article header bar */}
          <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="mx-auto max-w-[660px] px-4 h-12 flex items-center justify-between">
              <Link
                href="/library"
                className="inline-flex items-center gap-1 text-success text-sm font-medium hover:underline"
              >
                <ChevronLeft className="h-4 w-4" />
                Library
              </Link>
              <div className="flex items-center gap-2">
                {categoryName && (
                  <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase hidden sm:inline">
                    {categoryName} · {article.readTime} min
                  </span>
                )}
                <ArticleSaveWrapper articleId={article.id} isSaved={article.isSaved ?? false} />
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[660px] px-4 py-8 md:py-12 pb-24">
            {/* Article body */}
            <article className="max-w-none">
              {/* Category eyebrow */}
              {categoryName && (
                <p className="font-mono text-xs text-muted-foreground tracking-wider uppercase mb-4">
                  {categoryName}
                </p>
              )}

              {/* H1: serif 44px */}
              <h1 className="font-display text-4xl leading-[1.14] tracking-tight text-foreground">
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.excerpt && (
                <p className="mt-4 text-[17px] text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Author + date row */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-[30px] w-[30px] rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <span className="font-display text-sm font-medium text-success">
                    {(article.author || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {article.author || 'Growth'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <RelativeTime date={article.publishedAt} /> · {article.readTime} min read
                  </span>
                </div>
              </div>

              {/* Hero image (16:7, rounded-xl, with border) */}
              {article.imageUrl && (
                <div className="relative mt-8 mb-8 aspect-[16/7] w-full overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 660px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Body text */}
              <ArticleMarkdown content={article.content} />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* HR before action bar */}
              <hr className="border-border my-9" />

              {/* Action bar: pill buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                  <ArticleLikeWrapper
                    articleId={article.id}
                    likeCount={article.likeCount ?? 0}
                    isLiked={article.isLiked ?? false}
                    initialArticleData={response ?? undefined}
                  />
                  <span className="text-xs text-muted-foreground">liked</span>
                </div>
                <ArticleShareButton articleId={article.id} title={article.title} />
                <Link
                  href="/report"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-[color] hover:text-foreground"
                >
                  Report
                </Link>
              </div>

              {/* "Make this a habit" CTA card */}
              <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <p className="font-mono text-[0.65rem] tracking-widest text-muted-foreground mb-2">
                  MAKE THIS A HABIT
                </p>
                <h3 className="font-display text-lg text-foreground leading-snug mb-1">
                  Turn this insight into a daily practice
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a habit based on this article to your plan and start tracking today.
                </p>
                <Link
                  href={{
                    pathname: '/plan',
                    query: {
                      newHabitFromArticle: '1',
                      name: article.title,
                      description: article.excerpt ?? '',
                      category: article.category?.slug ?? '',
                    },
                  }}
                >
                  <Button variant="success" size="sm">
                    <Plus className="h-4 w-4" />
                    Add to Plan
                  </Button>
                </Link>
              </div>
            </article>
          </div>

          {/* Next article sidebar (sticky, 210px) */}
          {nextArticle && (
            <div className="hidden lg:block fixed right-6 top-24 w-[210px]">
              <div className="sticky top-24">
                <p className="font-mono text-[0.65rem] tracking-widest text-muted-foreground mb-2">
                  NEXT
                </p>
                <Link
                  href={`/article/${nextArticle.id}`}
                  className="group block"
                >
                  <h4 className="font-display text-base leading-snug text-foreground group-hover:text-success transition-colors">
                    {nextArticle.title}
                  </h4>
                  {nextArticle.category && (
                    <p className="font-mono text-[0.65rem] text-muted-foreground tracking-wider uppercase mt-2">
                      {nextArticle.category.name}
                    </p>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
