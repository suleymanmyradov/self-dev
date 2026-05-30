import api from './axios-client';
import { CategoriesResponseSchema } from '@/lib/validation';
import type { CategoriesResponse, EntityType } from './types';

export async function listCategories(entityType: EntityType): Promise<CategoriesResponse> {
  const response = await api.get<unknown>('/categories', { entityType });
  return CategoriesResponseSchema.parse(response);
}
