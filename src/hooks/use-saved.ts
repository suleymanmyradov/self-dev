import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from '@/api/saved';
import type { SaveItemRequest, PageParams } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      toast.success('Item saved successfully');
    },
    onError: handleMutationError,
  });
}

export function useRemoveSavedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeSavedItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
      toast.success('Item removed from saved');
    },
    onError: handleMutationError,
  });
}
