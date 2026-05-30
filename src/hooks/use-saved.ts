import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSavedItems, listSavedDetailed, saveItem, removeSavedItem } from '@/api/saved';
import type { SaveItemRequest, PageParams } from '@/api';

/**
 * Hook to fetch saved items
 */
export function useSavedItems(params: PageParams = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['saved', params],
    queryFn: () => listSavedItems(params),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch saved items with hydrated details (single request, no N+1)
 */
export function useSavedItemsDetailed(params: PageParams = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ['saved-detailed', params],
    queryFn: () => listSavedDetailed(params),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to save an item
 */
export function useSaveItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SaveItemRequest) => saveItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}

/**
 * Hook to remove a saved item
 */
export function useRemoveSavedItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => removeSavedItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}
