"use client";

import { useState, useCallback, useEffect } from "react";
import { useLikeArticle } from "@/hooks";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleLikeWrapperProps {
  articleId: string;
  likeCount: number;
  isLiked: boolean;
}

export default function ArticleLikeWrapper({ articleId, likeCount, isLiked }: ArticleLikeWrapperProps) {
  const likeMutation = useLikeArticle();

  // Local state synced from server props; mutation result updates it directly
  const [displayCount, setDisplayCount] = useState(likeCount);
  const [displayLiked, setDisplayLiked] = useState(isLiked);

  // Keep local state in sync when navigating to a different article
  useEffect(() => {
    setDisplayCount(likeCount);
    setDisplayLiked(isLiked);
  }, [likeCount, isLiked]);

  const handleToggleLike = useCallback(() => {
    if (likeMutation.isPending) return;

    // Optimistic local update for instant feedback
    setDisplayLiked((prev) => !prev);
    setDisplayCount((prev) => (displayLiked ? Math.max(0, prev - 1) : prev + 1));

    likeMutation.mutate(articleId, {
      onSuccess: (data) => {
        setDisplayCount(data.newLikeCount);
        setDisplayLiked(data.isLiked);
      },
      onError: () => {
        // Rollback on error
        setDisplayLiked(isLiked);
        setDisplayCount(likeCount);
      },
    });
  }, [likeMutation, articleId, displayLiked, isLiked, likeCount]);

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
