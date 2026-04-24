import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { getArticle } from "@/api";
import { formatRelativeTime } from "@/lib/time-format";

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

  const response = await getArticle(id).catch(() => null);
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
      <h1 className="text-3xl font-bold leading-tight tracking-tight">
        {article.title}
      </h1>

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
