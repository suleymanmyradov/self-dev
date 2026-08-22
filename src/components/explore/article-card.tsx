"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import type { Article } from '@/api';

interface ArticleCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave: () => void;
  isSavePending?: boolean;
}

export function ArticleCard({ article, isSaved, onToggleSave, isSavePending = false }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-border">
      {article.imageUrl ? (
        <div className="relative h-[132px] w-full overflow-hidden bg-muted">
          <Link href={`/article/${article.id}`} className="relative block size-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
            />
          </Link>
        </div>
      ) : (
        <div className="h-[132px] w-full bg-secondary" />
      )}

      <div className="p-4">
        {/* Category + read time in mono */}
        <div className="mb-2 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
          {article.category?.name ?? 'Article'}
          {' · '}
          <span className="tabular-nums">{article.readTime} MIN</span>
        </div>

        {/* Serif title */}
        <h3 className="font-display text-lg font-normal leading-tight tracking-tight text-foreground">
          <Link href={`/article/${article.id}`} className="transition-[color] hover:text-muted-foreground">
            {article.title}
          </Link>
        </h3>

        {/* Description */}
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        {/* Footer: like count + Save/Saved link */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {article.likeCount !== undefined && (
              <span className="font-mono tabular-nums">{article.likeCount} likes</span>
            )}
          </span>
          <button
            type="button"
            onClick={onToggleSave}
            disabled={isSavePending}
            className="text-xs text-success transition-[color] hover:text-success/80 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isSaved ? "Unsave article" : "Save article"}
            aria-pressed={isSaved}
          >
            {isSavePending ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </Card>
  );
}
