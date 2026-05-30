"use client";

import { useMemo, useCallback } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedItems, useSaveItem, useRemoveSavedItem } from '@/hooks';
import { toast } from '@/components/ui/sonner';

interface ArticleSaveButtonProps {
  articleId: string;
}

export default function ArticleSaveButton({ articleId }: ArticleSaveButtonProps) {
  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const saveItem = useSaveItem();
  const removeSavedItem = useRemoveSavedItem();

  const savedArticleItems = useMemo(
    () => savedItems?.filter((item) => item.itemType === 'article' && item.itemId === articleId),
    [savedItems, articleId]
  );
  const isSaved = useMemo(() => (savedArticleItems?.length ?? 0) > 0, [savedArticleItems]);
  const savedItem = useMemo(() => savedArticleItems?.[0], [savedArticleItems]);

  const handleToggleSave = useCallback(async () => {
    if (savedItem) {
      try {
        await removeSavedItem.mutateAsync(savedItem.id);
        toast.success('Article removed from saved');
      } catch {
        toast.error('Failed to remove article');
      }
    } else {
      try {
        await saveItem.mutateAsync({ itemType: 'article', itemId: articleId });
        toast.success('Article saved');
      } catch {
        toast.error('Failed to save article');
      }
    }
  }, [savedItem, articleId, removeSavedItem, saveItem]);

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggleSave}
      disabled={saveItem.isPending || removeSavedItem.isPending}
      aria-label={isSaved ? "Remove from saved" : "Save article"}
      className="shrink-0"
    >
      {isSaved ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}