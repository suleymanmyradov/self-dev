"use client";

import { useCallback } from "react";
import { useArticle, useLikeArticle } from "@/hooks";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleResponse } from "@/api";

interface ArticleLikeWrapperProps {
  articleId: string;
  likeCount: number;
  isLiked: boolean;
  /** Server-fetched article response, used as initialData for the client-side refetch. */
  initialArticleData?: ArticleResponse;
}

export default function ArticleLikeWrapper({
  articleId,
  likeCount,
  isLiked,
  initialArticleData,
}: ArticleLikeWrapperProps) {
  const likeMutation = useLikeArticle();

  // Fetch the article client-side with auth to get the correct isLiked state.
  // The server-side cached fetch is unauthenticated, so isLiked is always
  // false from the server. This refetches with the user's auth cookie and
  // derives the display state from the live query data, falling back to the
  // server props during SSR / before the client fetch resolves.
  // The useLikeArticle mutation does optimistic updates on the same
  // ['article', articleId] query key, so the UI updates instantly on click.
  const { data: article } = useArticle(articleId, initialArticleData);

  const displayLiked = article ? article.isLiked ?? false : isLiked;
  const displayCount = article ? article.likeCount ?? 0 : likeCount;

  const handleToggleLike = useCallback(() => {
    if (likeMutation.isPending) return;
    likeMutation.mutate(articleId);
  }, [likeMutation, articleId]);

  const isPending = likeMutation.isPending && likeMutation.variables === articleId;

  return (
    <button
      onClick={handleToggleLike}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
        displayLiked
          ? "text-destructive bg-destructive/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
      aria-label={displayLiked ? "Unlike article" : "Like article"}
    >
      <Heart className={cn("h-4 w-4", displayLiked && "fill-current")} />
      <span className="tabular-nums font-medium">{displayCount}</span>
    </button>
  );
}
