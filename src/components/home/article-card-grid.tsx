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
};

export function ArticleCardGrid({ 
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
}: ArticleCardGridProps) {
  const link = href ?? (id ? `/article/${id}` : "#");
  const likeState = useToggleState(initialLikes, onLike);
  const saveState = useToggleState(initialSaves, onSave);

  const categoryColor = category ? CATEGORY_COLORS[category] || "bg-secondary text-secondary-foreground" : "";

  return (
    <Link href={link} className="group block">
      <Card className={cn(
        "overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300",
        "hover:border-border hover:shadow-sm hover:bg-card",
        "flex flex-col h-full",
        className
      )}>
        {/* Top Image - 3:2 ratio for taller cards */}
        <div className="relative w-full aspect-[3/2] overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category badge on image */}
          {category && (
            <div className="absolute top-2 left-2">
              <Badge className={cn("rounded-full px-2 py-0 text-[0.6rem] font-medium border-0 shadow-sm", categoryColor)}>
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-3">
          {/* Meta */}
          <span className="text-[0.7rem] text-muted-foreground mb-1">{formatRelativeTime(postedAt)}</span>

          {/* Title */}
          <h3 className="font-display text-sm font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Excerpt - compact */}
          {excerpt ? (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 flex-1">
              {excerpt}
            </p>
          ) : <div className="flex-1" />}

          {/* Actions */}
          <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/30">
            <button 
              onClick={(e) => likeState.toggle(e, id)}
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
                likeState.isActive 
                  ? "text-red-500" 
                  : "text-muted-foreground hover:text-foreground"
              )} 
              aria-label="Like"
            >
              <Heart className={cn("h-3 w-3", likeState.isActive && "fill-current")} />
              <span className="tabular-nums">{likeState.value}</span>
            </button>
            <button 
              onClick={(e) => saveState.toggle(e, id)}
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
                saveState.isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )} 
              aria-label="Save"
            >
              <Bookmark className={cn("h-3 w-3", saveState.isActive && "fill-current")} />
              {saveState.value > 0 && <span className="tabular-nums">{saveState.value}</span>}
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
