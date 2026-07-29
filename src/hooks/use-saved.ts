import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from '@/api/saved';
import type { SaveItemRequest, PageParams, ArticlesResponse, ArticleResponse } from '@/api';
import { toast } from 'sonner';

const DEFAULT_SAVED_PARAMS: PageParams = { page: 1, limit: 20 };

export function useSavedItems(params: PageParams = DEFAULT_SAVED_PARAMS) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['saved', page ?? 1, limit ?? 20],
    queryFn: () => listSavedItems({ page, limit }),
    select: (data) => data.data,
  });
}

const DEFAULT_SAVED_DETAILED_PARAMS: PageParams = { page: 1, limit: 20 };

export function useSavedItemsDetailed(params: PageParams = DEFAULT_SAVED_DETAILED_PARAMS) {
  const { page, limit } = params;
  return useQuery({
    queryKey: ['saved', 'detailed', page ?? 1, limit ?? 20],
    queryFn: () => listSavedDetailed({ page, limit }),
    select: (data) => data.data,
  });
}

export function useSaveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveItemRequest) => saveItem(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      await queryClient.cancelQueries({ queryKey: ['article', data.itemId] });

      const previousSaved = new Map<readonly unknown[], unknown>();
      const previousArticles = queryClient.getQueriesData<ArticlesResponse>({ queryKey: ['articles'] });
      const previousArticle = queryClient.getQueryData<ArticleResponse>(['article', data.itemId]);

      // Optimistic update for saved list queries
      queryClient.setQueriesData<unknown>({ queryKey: ['saved'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        previousSaved.set(['saved'], old);
        const typedOld = old as { data?: Array<{ id: string; itemType: string; itemId: string; userId: string; createdAt: string }> };
        const currentItems = typedOld.data ?? [];
        const optimisticItem = {
          id: `optimistic-${Date.now()}`,
          itemType: data.itemType,
          itemId: data.itemId,
          userId: '',
          createdAt: new Date().toISOString(),
        };
        return { ...typedOld, data: [...currentItems, optimisticItem] };
      });

      // Optimistic update for article list queries
      queryClient.setQueriesData<ArticlesResponse>({ queryKey: ['articles'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.id === data.itemId ? { ...a, isSaved: true } : a
          ),
        };
      });

      // Optimistic update for single-article query
      queryClient.setQueryData<ArticleResponse>(['article', data.itemId], (old) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, isSaved: true } };
      });

      return { previousSaved, previousArticles, previousArticle };
    },
    onError: (_err, data, context) => {
      if (context?.previousSaved) {
        context.previousSaved.forEach((value, key) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousArticles) {
        context.previousArticles.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', data.itemId], context.previousArticle);
      }
      toast.error('Failed to save item. Please try again.');
    },
    onSettled: () => {
      // Only invalidate the saved-items list so the saved-items list stays fresh.
      // We intentionally DO NOT invalidate ['articles'] — the optimistic update
      // already flipped isSaved, and invalidating would trigger a refetch that
      // causes the home page loading spinner to flash (isFetching == isLoading).
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onSuccess: () => {
      toast.success('Item saved successfully');
    },
  });
}

export function useRemoveSavedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSavedItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      await queryClient.cancelQueries({ queryKey: ['articles'] });

      const previousSaved = new Map<readonly unknown[], unknown>();
      const previousArticles = queryClient.getQueriesData<ArticlesResponse>({ queryKey: ['articles'] });

      // Find the articleId associated with this saved item so we can
      // update the article cache too.
      let articleId: string | undefined;
      const savedQueries = queryClient.getQueriesData<{
        data?: Array<{ id: string; itemId: string; itemType: string }>;
      }>({ queryKey: ['saved'] });
      for (const [, data] of savedQueries) {
        const item = data?.data?.find((i) => i.id === id);
        if (item) {
          articleId = item.itemId;
          break;
        }
      }
      const previousArticle = articleId
        ? queryClient.getQueryData<ArticleResponse>(['article', articleId])
        : undefined;

      // Optimistic update for saved list queries
      queryClient.setQueriesData<unknown>({ queryKey: ['saved'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        previousSaved.set(['saved'], old);
        const typedOld = old as { data?: Array<{ id: string }> };
        const currentItems = typedOld.data ?? [];
        return { ...typedOld, data: currentItems.filter((item) => item.id !== id) };
      });

      // Optimistic update for article list queries
      if (articleId) {
        queryClient.setQueriesData<ArticlesResponse>({ queryKey: ['articles'] }, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((a) =>
              a.id === articleId ? { ...a, isSaved: false } : a
            ),
          };
        });

        queryClient.setQueryData<ArticleResponse>(['article', articleId], (old) => {
          if (!old?.data) return old;
          return { ...old, data: { ...old.data, isSaved: false } };
        });
      }

      return { previousSaved, previousArticles, previousArticle, articleId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSaved) {
        context.previousSaved.forEach((value, key) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousArticles) {
        context.previousArticles.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.articleId && context?.previousArticle) {
        queryClient.setQueryData(['article', context.articleId], context.previousArticle);
      }
      toast.error('Failed to remove item. Please try again.');
    },
    onSettled: () => {
      // Only invalidate the saved-items list so the saved-items list stays fresh.
      // We intentionally DO NOT invalidate ['articles'] — the optimistic update
      // already flipped isSaved, and invalidating would trigger a refetch that
      // causes the home page loading spinner to flash (isFetching == isLoading).
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onSuccess: () => {
      toast.success('Item removed from saved');
    },
  });
}
