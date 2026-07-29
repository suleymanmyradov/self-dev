import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bookmark } from 'lucide-react';
import type { Article } from '@/api';

interface FeaturedCardProps {
  article: Article;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function FeaturedCard({ article, isSaved, onToggleSave }: FeaturedCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-xl border-border md:flex-row">
      {article.imageUrl ? (
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted md:h-auto md:w-[300px]">
          <Link href={`/article/${article.id}`} className="block size-full">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
            />
          </Link>
        </div>
      ) : (
        <div className="h-48 w-full shrink-0 bg-secondary md:h-auto md:w-[300px]" />
      )}

      {/* Right: content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Mono label header */}
        <div className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
          EDITOR&apos;S PICK
          {article.category && <> · {article.category.name.toUpperCase()}</>}
          {' · '}
          <span className="tabular-nums">{article.readTime} MIN</span>
        </div>

        {/* Serif title */}
        <h3 className="font-display text-2xl font-normal leading-tight tracking-tight text-foreground">
          {article.title}
        </h3>

        {/* Description */}
        {article.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex items-center gap-3">
          <Button asChild size="sm" variant="default" className="h-8 gap-1.5 rounded-lg text-xs">
            <Link href={`/article/${article.id}`}>
              Read <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 rounded-lg text-xs"
            onClick={onToggleSave}
            aria-label={isSaved ? 'Unsave article' : 'Save article'}
            aria-pressed={isSaved}
          >
            <Bookmark className={isSaved ? 'size-3.5 fill-current' : 'size-3.5'} />
            {isSaved ? 'Saved' : 'Save for tonight'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
