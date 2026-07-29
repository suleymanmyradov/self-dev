"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToggleState } from "@/hooks/use-toggle-state";
import { Heart, Bookmark } from "lucide-react";
import { formatRelativeTime } from "@/lib/time-format";
import { memo } from "react";

export type ArticleCardGridProps = {
  id?: string;
  href?: string;
  title: string;
  excerpt?: string;
  image: string;
  category?: string;
  postedAt: string;
  likes?: number;
  isLiked?: boolean;
  saves?: number;
  isSaved?: boolean;
  className?: string;
  onLike?: (id: string) => void;
  onToggleSave?: () => void;
  isLikePending?: boolean;
  index?: number;
  /** Compact mode: small image strip + mono category + serif title */
  compact?: boolean;
};

export const ArticleCardGrid = memo(function ArticleCardGrid({
  id,
  href,
  title,
  excerpt,
  image,
  category,
  postedAt,
  likes = 0,
  isLiked = false,
  saves: initialSaves = 0,
  isSaved = false,
  className,
  onLike,
  onToggleSave,
  isLikePending = false,
  index = 0,
  compact = false,
}: ArticleCardGridProps) {
  const link = href ?? (id ? `/article/${id}` : "#");
  const saveState = useToggleState(initialSaves, isSaved);

  if (compact) {
    return (
      <Link href={link} className="group block">
        <Card className={cn(
          "overflow-hidden border-border bg-card transition-[background-color,box-shadow] duration-300",
          "hover:shadow-sm hover:bg-card",
          "flex flex-col h-full animate-in fade-in-0 fill-mode-backwards duration-[140ms]",
          className
        )}>
          {/* Small image strip — 84px wide, hatched pattern placeholder */}
          <div className="relative w-full aspect-[16/7] overflow-hidden bg-muted border-b border-border">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 330px"
              loading={index < 4 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-3.5">
            {/* Category + read time in mono */}
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <span className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  {category}
                </span>
              )}
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {formatRelativeTime(postedAt)}
              </span>
            </div>

            {/* Serif title */}
            <h3 className="font-display text-base font-medium leading-snug tracking-tight line-clamp-2 group-hover:text-foreground transition-colors duration-200">
              {title}
            </h3>

            {/* Excerpt */}
            {excerpt ? (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                {excerpt}
              </p>
            ) : <div className="flex-1" />}

            {/* Actions */}
            <div className="mt-auto pt-3 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isLikePending && id) onLike?.(id);
                }}
                disabled={isLikePending}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50 disabled:opacity-50",
                  isLiked
                    ? "text-destructive"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                <span className="tabular-nums font-medium">{likes}</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave?.();
                  saveState.toggle(e, id);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50",
                  isSaved
                    ? "text-success"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
                {saveState.value > 0 && <span className="tabular-nums font-medium">{saveState.value}</span>}
              </button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={link} className="group block">
      <Card className={cn(
        "overflow-hidden border-border bg-card transition-[background-color,box-shadow] duration-300",
        "hover:shadow-sm hover:bg-card",
        "flex flex-col h-full animate-in fade-in-0 fill-mode-backwards duration-[140ms]",
        className
      )}>
        {/* Top Image - 16:10 ratio for balanced cards */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={index < 4 ? "eager" : "lazy"}
            className="object-cover transition-transform duration-500"
          />
          {/* Category badge on image */}
          {category && (
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="px-2.5 py-0.5 text-[0.65rem] font-medium shadow-sm backdrop-blur-sm bg-background/80">
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-3.5">
          {/* Meta */}
          <span className="font-mono text-[0.65rem] text-muted-foreground mb-1.5 tracking-wider uppercase">{formatRelativeTime(postedAt)}</span>

          {/* Title */}
          <h3 className="font-display text-sm font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-foreground transition-colors duration-200">
            {title}
          </h3>

          {/* Excerpt - compact */}
          {excerpt ? (
            <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2 flex-1 leading-relaxed">
              {excerpt}
            </p>
          ) : <div className="flex-1" />}

          {/* Actions */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/30">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLikePending && id) onLike?.(id);
              }}
              disabled={isLikePending}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50 disabled:opacity-50",
                isLiked
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
              <span className="tabular-nums font-medium">{likes}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave?.();
                // Optimistic local toggle for immediate visual feedback
                saveState.toggle(e, id);
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50",
                isSaved
                  ? "text-success"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
              {saveState.value > 0 && <span className="tabular-nums font-medium">{saveState.value}</span>}
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
});
