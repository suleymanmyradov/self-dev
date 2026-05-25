"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useToggleState } from "@/hooks/use-toggle-state";
import { Heart, Share2, Bookmark, ArrowUpRight } from "lucide-react";

export type ArticleCardProps = {
  id?: string;
  href?: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  postedAt: string;
  likes?: number;
  shares?: number;
  saves?: number;
  className?: string;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onSave?: (id: string) => void;
};

export function ArticleCard({ 
  id, 
  href, 
  title, 
  excerpt, 
  image, 
  category, 
  postedAt, 
  likes: initialLikes = 0, 
  shares: initialShares = 0, 
  saves: initialSaves = 0, 
  className,
  onLike,
  onShare,
  onSave,
}: ArticleCardProps) {
  const link = href ?? (id ? `/article/${id}` : "#");
  const likeState = useToggleState(initialLikes, onLike);
  const saveState = useToggleState(initialSaves, onSave);
  const [shares, setShares] = useState(initialShares);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title,
      url: typeof window !== 'undefined' ? `${window.location.origin}${link}` : link,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    }
    
    setShares((s) => s + 1);
    if (id) onShare?.(id);
  };

  const categoryColor = category ? CATEGORY_COLORS[category] || "bg-secondary text-secondary-foreground" : "";

  return (
    <Link href={link} className="group block">
      <Card className={cn(
        "overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300",
        "hover:border-border hover:shadow-sm hover:bg-card",
        "flex flex-col sm:flex-row gap-0",
        className
      )}>
        {/* Left Image - Medium style */}
        {image && (
          <div className="relative shrink-0 w-full sm:w-48 sm:min-h-[140px] h-40 sm:h-auto overflow-hidden bg-muted">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 192px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-5">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-2">
            {category ? (
              <Badge className={cn("px-2 py-0 text-[0.65rem] font-medium border-0", categoryColor)}>
                {category}
              </Badge>
            ) : null}formatRelativeTime()
            <span className="text-xs text-muted-foreground">{postedAt}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg sm:text-xl font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt ? (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
              {excerpt}
            </p>
          ) : null}

          {/* Actions */}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => likeState.toggle(e, id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  likeState.isActive 
                    ? "text-red-500" 
                    : "text-muted-foreground hover:text-foreground"
                )} 
                aria-label="Like"
              >
                <Heart className={cn("h-3.5 w-3.5", likeState.isActive && "fill-current")} />
                <span className="tabular-nums">{likeState.value}</span>
              </button>
              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground" 
                aria-label="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="tabular-nums">{shares}</span>
              </button>
              <button 
                onClick={(e) => saveState.toggle(e, id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  saveState.isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )} 
                aria-label="Save"
              >
                <Bookmark className={cn("h-3.5 w-3.5", saveState.isActive && "fill-current")} />
                {saveState.value > 0 && <span className="tabular-nums">{saveState.value}</span>}
              </button>
            </div>
            
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
