import api from './client';
import type {
  SavedItemsResponse,
  SavedItemsDetailedResponse,
  SavedItemResponse,
  SaveItemRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  SAVED: '/saved',
  SAVED_ITEM: (id: string) => `/saved/${id}`,
};

const ENDPOINTS_DETAILED = {
  SAVED_DETAILED: '/saved/detailed',
};

/**
 * List saved items with pagination
 */
export async function listSavedItems(params: PageParams = { page: 1, limit: 20 }): Promise<SavedItemsResponse> {
  return api.get<SavedItemsResponse>(ENDPOINTS.SAVED, params);
}

/**
 * List saved items with hydrated details (single request, no N+1)
 */
export async function listSavedDetailed(params: PageParams = { page: 1, limit: 20 }): Promise<SavedItemsDetailedResponse> {
  return api.get<SavedItemsDetailedResponse>(ENDPOINTS_DETAILED.SAVED_DETAILED, params);
}

/**
 * Save an item
 */
export async function saveItem(data: SaveItemRequest): Promise<SavedItemResponse> {
  return api.post<SavedItemResponse>(ENDPOINTS.SAVED, data);
}

/**
 * Remove a saved item
 */
export async function removeSavedItem(id: string): Promise<void> {
  return api.delete(ENDPOINTS.SAVED_ITEM(id));
}
