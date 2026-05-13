"use client";

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

  const isSaved = savedItems?.some(
    (item) => item.itemType === 'article' && item.itemId === articleId
  );

  const handleToggleSave = async () => {
    const savedItem = savedItems?.find(
      (item) => item.itemType === 'article' && item.itemId === articleId
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
        await saveItem.mutateAsync({ itemType: 'article', itemId: articleId });
        toast.success('Article saved');
      } catch {
        toast.error('Failed to save article');
      }
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleToggleSave}
      disabled={saveItem.isPending || removeSavedItem.isPending}
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