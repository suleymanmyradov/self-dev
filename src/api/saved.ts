import api from './client';
import type {
  SavedItem,
  SavedItemsResponse,
  SavedItemResponse,
  SaveItemRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  SAVED: '/saved',
  SAVED_ITEM: (id: string) => `/saved/${id}`,
};

/**
 * List saved items with pagination
 */
export async function listSavedItems(params: PageParams = { page: 1, limit: 20 }): Promise<SavedItemsResponse> {
  return api.get<SavedItemsResponse>(ENDPOINTS.SAVED, params);
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
