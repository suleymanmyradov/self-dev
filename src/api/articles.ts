import { api } from './axios-client';
import {
  ArticlesResponseSchema,
  ArticleResponseSchema,
  LikeArticleResponseSchema,
  ShareArticleResponseSchema,
} from '@/lib/validation';
import type {
  ArticlesResponse,
  ArticleResponse,
  ListArticlesParams,
  LikeArticleResponse,
  ShareArticleResponse,
  GetAuthorArticlesParams,
} from './types';

export async function listArticles(params?: ListArticlesParams): Promise<ArticlesResponse> {
  const response = await api.get<unknown>('/articles', params);
  return ArticlesResponseSchema.parse(response);
}

export async function getArticle(id: string): Promise<ArticleResponse> {
  const response = await api.get<unknown>(`/articles/${encodeURIComponent(id)}`);
  return ArticleResponseSchema.parse(response);
}

export async function likeArticle(id: string): Promise<LikeArticleResponse> {
  const response = await api.post<unknown>(`/articles/${encodeURIComponent(id)}/like`, { id });
  return LikeArticleResponseSchema.parse(response);
}

export async function shareArticle(id: string, platform: string): Promise<ShareArticleResponse> {
  const response = await api.post<unknown>(`/articles/${encodeURIComponent(id)}/share`, { id, platform });
  return ShareArticleResponseSchema.parse(response);
}

export async function getAuthorArticles(params: GetAuthorArticlesParams): Promise<ArticlesResponse> {
  const response = await api.get<unknown>(`/articles/author/${encodeURIComponent(params.authorId)}`, params);
  return ArticlesResponseSchema.parse(response);
}
