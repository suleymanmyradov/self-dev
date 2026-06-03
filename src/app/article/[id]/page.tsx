import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { getArticleServer } from "@/api/server";
import { listArticles } from "@/api";
import { formatRelativeTime } from "@/lib/time-format";
import ArticleSaveWrapper from "./article-save-wrapper";

// =============================================================================
// Shared server fetch with React cache — dedupes across generateMetadata + page
// =============================================================================

const fetchArticle = cache(async (id: string) => {
  try {
    return await getArticleServer(id);
  } catch (error) {
    console.error(`[ArticlePage] Failed to fetch article ${id}:`, error);
    return null;
  }
});

// =============================================================================
// Static generation for popular articles
// =============================================================================

export const revalidate = 3600; // ISR: revalidate every hour

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

function renderParagraphs(content: string) {
  return content.split("\n\n").map((para, idx) => <p key={idx}>{para}</p>);
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

  const response = await fetchArticle(id);
  const article = response?.data;

  if (!article) return notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      {/* Hero banner intentionally removed */}

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
        <ArticleSaveWrapper articleId={article.id} isSaved={article.isSaved ?? false} />
      </div>

      {/* Meta */}
      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{formatRelativeTime(article.publishedAt)}</span>
        <span className="mx-1">·</span>
        <span>{article.readTime} min read</span>
      </div>

      <Separator className="my-6" />

      {/* Body */}
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        {renderParagraphs(article.content)}
      </article>
    </div>
  );
}
