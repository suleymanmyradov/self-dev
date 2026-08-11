'use client';

import Link from 'next/link';
import { ArticleCardGrid } from '@/components/home/article-card-grid';
import type { Article } from '@/api';

interface ArticlesSectionProps {
  articles: Article[];
  onLike: (id: string) => void;
  onToggleSave: (articleId: string) => void;
  isLikePendingFor: (id: string) => boolean;
  getIsSaved: (articleId: string) => boolean;
}

export function ArticlesSection({
  articles,
  onLike,
  onToggleSave,
  isLikePendingFor,
  getIsSaved,
}: ArticlesSectionProps) {
  if (articles.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-xs text-foreground tracking-wide">
            Worth reading tonight
          </h2>
          <Link href="/library" className="text-success text-xs font-medium hover:underline">
            Library
          </Link>
        </div>
        <p className="text-sm text-muted-foreground py-4">No articles available.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-xs text-foreground tracking-wide">
          Worth reading tonight
        </h2>
        <Link href="/library" className="text-success text-xs font-medium hover:underline">
          Library
        </Link>
      </div>

      <div className="hidden md:grid grid-cols-2 gap-4">
        {articles.map((a, i) => (
          <ArticleCardGrid
            key={a.id}
            id={a.id}
            title={a.title}
            excerpt={a.excerpt}
            image={a.imageUrl || '/images/article-placeholder.svg'}
            category={a.category?.name}
            postedAt={a.publishedAt}
            likes={a.likeCount ?? 0}
            isLiked={a.isLiked ?? false}
            isSaved={getIsSaved(a.id) || (a.isSaved ?? false)}
            onLike={onLike}
            onToggleSave={() => onToggleSave(a.id)}
            isLikePending={isLikePendingFor(a.id)}
            index={i}
            compact
          />
        ))}
      </div>

      {/* Mobile: single column */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {articles.map((a, i) => (
          <ArticleCardGrid
            key={a.id}
            id={a.id}
            title={a.title}
            excerpt={a.excerpt}
            image={a.imageUrl || '/images/article-placeholder.svg'}
            category={a.category?.name}
            postedAt={a.publishedAt}
            likes={a.likeCount ?? 0}
            isLiked={a.isLiked ?? false}
            isSaved={getIsSaved(a.id) || (a.isSaved ?? false)}
            onLike={onLike}
            onToggleSave={() => onToggleSave(a.id)}
            isLikePending={isLikePendingFor(a.id)}
            index={i}
            compact
          />
        ))}
      </div>
    </section>
  );
}
