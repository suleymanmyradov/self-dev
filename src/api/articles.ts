import { api } from './client';
import type { ArticlesResponse, ArticleResponse, ListArticlesParams } from './types';

export async function listArticles(params?: ListArticlesParams): Promise<ArticlesResponse> {
  return api.get<ArticlesResponse>('/articles', params);
}

export async function getArticle(id: string): Promise<ArticleResponse> {
  return api.get<ArticleResponse>(`/articles/${id}`);
}
