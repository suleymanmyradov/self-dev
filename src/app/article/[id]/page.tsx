import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getArticle } from "@/api";

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

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="rounded-full px-2 py-0.5">
          {article.category}
        </Badge>
        <span>•</span>
        <span>{article.publishedAt}</span>
      </div>

      {/* Title */}
      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
        {article.title}
      </h1>

      <Separator className="my-6" />

      {/* Body */}
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        {renderParagraphs(article.content)}
      </article>
    </div>
  );
}
