import api from './client';
import type {
  SearchResponse,
  SearchParams,
} from './types';

const ENDPOINTS = {
  SEARCH: '/search',
};

/**
 * Search across content
 */
export async function search(params: SearchParams): Promise<SearchResponse> {
  return api.get<SearchResponse>(ENDPOINTS.SEARCH, params);
}
