'use client';

import { useMemo, useCallback } from 'react';
import {
  useLikeArticle,
  useSavedItems,
  useSaveItem,
  useRemoveSavedItem,
} from '@/hooks';

export function useArticleActions() {
  const likeArticleMutation = useLikeArticle();
  const handleLike = (id: string) => {
    if (likeArticleMutation.isPending) return;
    likeArticleMutation.mutate(id);
  };
  const isLikePendingFor = (id: string) =>
    likeArticleMutation.isPending && likeArticleMutation.variables === id;

  const { data: savedItems } = useSavedItems({ page: 1, limit: 100 });
  const saveItem = useSaveItem();
  const removeSavedItem = useRemoveSavedItem();

  const savedArticleMap = useMemo(() => {
    const map = new Map<string, string>();
    savedItems?.forEach((item) => {
      if (item.itemType === 'article') {
        map.set(item.itemId, item.id);
      }
    });
    return map;
  }, [savedItems]);

  const getIsSaved = useCallback(
    (articleId: string) => savedArticleMap.has(articleId),
    [savedArticleMap],
  );

  const isSavePendingFor = useCallback(
    (articleId: string) =>
      (saveItem.isPending && saveItem.variables?.itemId === articleId) ||
      (removeSavedItem.isPending && savedArticleMap.get(articleId) === removeSavedItem.variables),
    [saveItem, removeSavedItem, savedArticleMap],
  );

  const handleToggleSave = useCallback(
    async (articleId: string) => {
      if (isSavePendingFor(articleId)) return;
      const savedItemId = savedArticleMap.get(articleId);
      if (savedItemId) {
        await removeSavedItem.mutateAsync(savedItemId);
      } else {
        await saveItem.mutateAsync({ itemType: 'article', itemId: articleId });
      }
    },
    [savedArticleMap, saveItem, removeSavedItem, isSavePendingFor],
  );

  return {
    handleLike,
    isLikePendingFor,
    getIsSaved,
    isSavePendingFor,
    handleToggleSave,
  };
}
