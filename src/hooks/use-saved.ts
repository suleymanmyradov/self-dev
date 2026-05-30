import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from '@/api/saved';
import type { SaveItemRequest, SavedItemsResponse, SavedItemsDetailedResponse, PageParams } from '@/api';
import { toast } from 'sonner';
import { ApiError } from '@/api/axios-client';

function handleMutationError(error: unknown) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred';
  toast.error(message);
}

export function useSavedItems(params: PageParams = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['saved', params],
    queryFn: () => listSavedItems(params),
    select: (data) => data.data,
  });
}

export function useSavedItemsDetailed(params: PageParams = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['saved', 'detailed', params],
    queryFn: () => listSavedDetailed(params),
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
