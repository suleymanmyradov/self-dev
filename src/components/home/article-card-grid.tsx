"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
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
  saves?: number;
  className?: string;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  index?: number;
};

export const ArticleCardGrid = memo(function ArticleCardGrid({
  id,
  href,
  title,
  excerpt,
  image,
  category,
  postedAt,
  likes: initialLikes = 0,
  saves: initialSaves = 0,
  className,
  onLike,
  onSave,
  index = 0,
}: ArticleCardGridProps) {
  const link = href ?? (id ? `/article/${id}` : "#");
  const likeState = useToggleState(initialLikes, onLike);
  const saveState = useToggleState(initialSaves, onSave);

  const categoryColor = category ? CATEGORY_COLORS[category] || "bg-secondary text-secondary-foreground" : "";

  // Staggered entrance animation delay
  const animationDelay = `${Math.min(index * 50, 500)}ms`;

  return (
    <Link href={link} className="group block" style={{ animationDelay }}>
      <Card className={cn(
        "overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300",
        "hover:border-border/80 hover:shadow-md hover:bg-card hover:-translate-y-0.5",
        "flex flex-col h-full animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-500",
        className
      )}>
        {/* Top Image - 16:10 ratio for balanced cards */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 4}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category badge on image */}
          {category && (
            <div className="absolute top-2 left-2">
              <Badge className={cn("px-2.5 py-0.5 text-[0.65rem] font-medium border shadow-sm backdrop-blur-sm bg-background/80", categoryColor)}>
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-3.5">
          {/* Meta */}
          <span className="text-[0.7rem] text-muted-foreground mb-1.5 tracking-wide uppercase">{formatRelativeTime(postedAt)}</span>

          {/* Title */}
          <h3 className="font-display text-sm font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
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
              onClick={(e) => likeState.toggle(e, id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50",
                likeState.isActive
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Like"
            >
              <Heart className={cn("h-3.5 w-3.5", likeState.isActive && "fill-current")} />
              <span className="tabular-nums font-medium">{likeState.value}</span>
            </button>
            <button
              onClick={(e) => saveState.toggle(e, id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-secondary/50",
                saveState.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Save"
            >
              <Bookmark className={cn("h-3.5 w-3.5", saveState.isActive && "fill-current")} />
              {saveState.value > 0 && <span className="tabular-nums font-medium">{saveState.value}</span>}
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
});
