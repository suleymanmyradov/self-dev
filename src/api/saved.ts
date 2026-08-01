import api from './axios-client';
import {
  SavedItemsResponseSchema,
  SavedItemsDetailedResponseSchema,
  SaveItemRequestSchema,
  SavedItemResponseSchema,
} from '@/lib/validation';
import type {
  SavedItemsResponse,
  SavedItemsDetailedResponse,
  SaveItemRequest,
  SavedItemResponse,
  PageParams,
} from './types';

export async function listSavedItems(params: PageParams = { page: 1, limit: 20 }): Promise<SavedItemsResponse> {
  const response = await api.get<unknown>('/saved', params);
  return SavedItemsResponseSchema.parse(response);
}

export async function listSavedDetailed(params: PageParams = { page: 1, limit: 20 }): Promise<SavedItemsDetailedResponse> {
  const response = await api.get<unknown>('/saved/detailed', params);
  return SavedItemsDetailedResponseSchema.parse(response);
}

export async function saveItem(data: SaveItemRequest): Promise<SavedItemResponse> {
  const validated = SaveItemRequestSchema.parse(data);
  const response = await api.post<unknown>('/saved', validated);
  return SavedItemResponseSchema.parse(response);
}

export async function removeSavedItem(id: string): Promise<void> {
  await api.delete(`/saved/${encodeURIComponent(id)}`);
}
