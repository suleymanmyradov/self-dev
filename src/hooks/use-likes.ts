import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeArticle } from '@/api/articles';
import type { ArticlesResponse, ArticleResponse } from '@/api';
import { toast } from 'sonner';

export function useLikeArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => likeArticle(articleId),
    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      await queryClient.cancelQueries({ queryKey: ['article', articleId] });

      const previousArticles = queryClient.getQueriesData<ArticlesResponse>({ queryKey: ['articles'] });
      const previousArticle = queryClient.getQueryData<ArticleResponse>(['article', articleId]);

      // Optimistic update for article list queries
      queryClient.setQueriesData<ArticlesResponse>({ queryKey: ['articles'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  isLiked: !a.isLiked,
                  likeCount: (a.likeCount ?? 0) + (a.isLiked ? -1 : 1),
                }
              : a
          ),
        };
      });

      // Optimistic update for single-article query (if it exists)
      queryClient.setQueryData<ArticleResponse>(['article', articleId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isLiked: !old.data.isLiked,
            likeCount: (old.data.likeCount ?? 0) + (old.data.isLiked ? -1 : 1),
          },
        };
      });

      return { previousArticles, previousArticle };
    },
    onSuccess: (data, articleId) => {
      // Sync the actual server response into the cache, replacing the
      // optimistic guess with the real likeCount and isLiked values.
      queryClient.setQueriesData<ArticlesResponse>({ queryKey: ['articles'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.id === articleId
              ? { ...a, isLiked: data.isLiked, likeCount: data.newLikeCount }
              : a
          ),
        };
      });
      queryClient.setQueryData<ArticleResponse>(['article', articleId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, isLiked: data.isLiked, likeCount: data.newLikeCount },
        };
      });
    },
    onError: (_err, articleId, context) => {
      if (context?.previousArticles) {
        context.previousArticles.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousArticle) {
        queryClient.setQueryData(['article', articleId], context.previousArticle);
      }
      toast.error('Failed to update like. Please try again.');
    },
  });
}
