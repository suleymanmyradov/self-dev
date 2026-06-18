import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { getArticleCached } from "@/api/server-cache";
import { listArticles } from "@/api";
import { RelativeTime } from "@/components/shared/relative-time";
import { ArticleMarkdown } from "@/components/article/article-markdown";
import ArticleSaveWrapper from "./article-save-wrapper";
import ArticleLikeWrapper from "./article-like-wrapper";

// =============================================================================
// Shared server fetch with React cache — dedupes across generateMetadata + page
// =============================================================================

const fetchArticle = cache(async (id: string) => {
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

// ISR is handled by the `use cache` directive + `cacheLife('hours')` on
// getArticleCached. The route segment `revalidate` config is no longer used
// with cacheComponents enabled — cache lifetime is controlled by cacheLife.

export async function generateStaticParams() {
  try {
    const response = await listArticles({ limit: 50 });
    return (response.data ?? []).map((article) => ({
      id: article.id,
    }));
  } catch (error) {
    console.error('[ArticlePage] Failed to generate static params:', error);
    return [];
  }
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
// Helpers
// =============================================================================

// =============================================================================
// Component
// =============================================================================

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetchArticle(id);
  const article = response?.data;

  if (!article) return notFound();

  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
          {/* Hero image */}
          {article.imageUrl && (
            <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          {/* Category above title */}
          {article.category && (
            <div className="mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {article.category.name}
              </Badge>
            </div>
          )}

          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold leading-tight tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <ArticleLikeWrapper
                articleId={article.id}
                likeCount={article.likeCount ?? 0}
                isLiked={article.isLiked ?? false}
              />
              <ArticleSaveWrapper articleId={article.id} isSaved={article.isSaved ?? false} />
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span><RelativeTime date={article.publishedAt} /></span>
            <span className="mx-1">·</span>
            <span>{article.readTime} min read</span>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          {/* Body */}
          <article className="max-w-none">
            <ArticleMarkdown content={article.content} />
          </article>
        </div>
      </div>
    </div>
  );
}
