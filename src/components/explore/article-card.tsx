"use client";

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/category-styles';
import { formatRelativeTime } from '@/lib/time-format';
import type { Article } from '@/api';
import { useSavedItems, useSaveItem, useRemoveSavedItem } from '@/hooks';
import { toast } from '@/components/ui/sonner';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const saveItem = useSaveItem();
  const removeSavedItem = useRemoveSavedItem();

  const isSaved = savedItems?.some(
    (item) => item.itemType === 'article' && item.itemId === article.id
  );

  const handleToggleSave = async () => {
    const savedItem = savedItems?.find(
      (item) => item.itemType === 'article' && item.itemId === article.id
    );

    if (savedItem) {
      try {
        await removeSavedItem.mutateAsync(savedItem.id);
        toast.success('Article removed from saved');
      } catch {
        toast.error('Failed to remove article');
      }
    } else {
      try {
        await saveItem.mutateAsync({ itemType: 'article', itemId: article.id });
        toast.success('Article saved');
      } catch {
        toast.error('Failed to save article');
      }
    }
  };

  return (
    <Card className="hover-lift transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2">
          {article.category && (
            <Badge className={getCategoryBadgeClass(article.category.slug)}>
              {article.category.name}
            </Badge>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {formatRelativeTime(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {article.readTime} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleSave}
            disabled={saveItem.isPending || removeSavedItem.isPending}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/article/${article.id}`}>Read</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
