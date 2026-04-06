import { api } from './client';
import type { CategoriesResponse, EntityType } from './types';

export async function listCategories(entityType?: EntityType): Promise<CategoriesResponse> {
  return api.get<CategoriesResponse>('/categories', entityType ? { entityType } : undefined);
}
