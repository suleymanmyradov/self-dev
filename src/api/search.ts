import api from './axios-client';
import { SearchResponseSchema, SearchParamsSchema } from '@/lib/validation';
import type { SearchResponse, SearchParams } from './types';

export async function search(params: SearchParams): Promise<SearchResponse> {
  const validated = SearchParamsSchema.parse(params);
  const response = await api.get<unknown>('/search', validated);
  return SearchResponseSchema.parse(response);
}
