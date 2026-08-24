import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMemoryFacts,
  addMemoryFact,
  forgetMemoryFact,
  forgetAllMemoryFacts,
} from '@/api/personalization';
import type { ListMemoryFactsParams, AddMemoryFactRequest } from '@/api';

const MEMORY_FACTS_KEY = ['memory-facts'] as const;

const DEFAULT_PARAMS: ListMemoryFactsParams = { page: 1, limit: 50 };

export function useMemoryFacts(params: ListMemoryFactsParams = DEFAULT_PARAMS) {
  const { page, limit } = params;
  return useQuery({
    queryKey: [...MEMORY_FACTS_KEY, page ?? 1, limit ?? 50],
    queryFn: () => listMemoryFacts({ page, limit }),
    select: data => data.data,
  });
}

export function useAddMemoryFact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemoryFactRequest) => addMemoryFact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_FACTS_KEY });
    },
  });
}

export function useForgetMemoryFact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => forgetMemoryFact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_FACTS_KEY });
    },
  });
}

export function useForgetAllMemoryFacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => forgetAllMemoryFacts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORY_FACTS_KEY });
    },
  });
}
