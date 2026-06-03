"use client";

import { useMemo, useCallback } from "react";
import { useSavedItems, useSaveItem, useRemoveSavedItem } from "@/hooks";
import { toast } from "@/components/ui/sonner";
import ArticleSaveButton from "./article-save-button";

interface ArticleSaveWrapperProps {
  articleId: string;
  isSaved: boolean;
}

export default function ArticleSaveWrapper({ articleId, isSaved }: ArticleSaveWrapperProps) {
  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const saveItem = useSaveItem();
  const removeSavedItem = useRemoveSavedItem();

  // savedItem.id is still needed for the remove mutation (DELETE /saved/:id)
  const savedItem = useMemo(
    () => savedItems?.find((item) => item.itemType === "article" && item.itemId === articleId),
    [savedItems, articleId]
  );

  // Derive display state from live savedItems when available (updates after
  // mutations); fall back to the server prop during SSR hydration.
  const displayIsSaved = useMemo(() => {
    if (savedItems) {
      return savedItems.some((item) => item.itemType === "article" && item.itemId === articleId);
    }
    return isSaved;
  }, [savedItems, articleId, isSaved]);

  const handleToggleSave = useCallback(async () => {
    if (savedItem) {
      try {
        await removeSavedItem.mutateAsync(savedItem.id);
        toast.success("Article removed from saved");
      } catch {
        toast.error("Failed to remove article");
      }
    } else {
      try {
        await saveItem.mutateAsync({ itemType: "article", itemId: articleId });
        toast.success("Article saved");
      } catch {
        toast.error("Failed to save article");
      }
    }
  }, [savedItem, articleId, removeSavedItem, saveItem]);

  return (
    <ArticleSaveButton isSaved={displayIsSaved} onToggleSave={handleToggleSave} />
  );
}
