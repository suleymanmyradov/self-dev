import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from '@/api/saved';
import type { SaveItemRequest, PageParams } from '@/api';
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
      const previousData = new Map<readonly unknown[], unknown>();

      queryClient.setQueriesData<unknown>({ queryKey: ['saved'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        previousData.set(['saved'], old);
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

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach((value, key) => {
          queryClient.setQueryData(key, value);
        });
      }
    },
    onSettled: () => {
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
      const previousData = new Map<readonly unknown[], unknown>();

      queryClient.setQueriesData<unknown>({ queryKey: ['saved'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        previousData.set(['saved'], old);
        const typedOld = old as { data?: Array<{ id: string }> };
        const currentItems = typedOld.data ?? [];
        return { ...typedOld, data: currentItems.filter((item) => item.id !== id) };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach((value, key) => {
          queryClient.setQueryData(key, value);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onSuccess: () => {
      toast.success('Item removed from saved');
    },
  });
}
