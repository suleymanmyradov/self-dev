import { api } from './client';
import type {
  ArticlesResponse,
  ArticleResponse,
  ListArticlesParams,
  LikeArticleRequest,
  LikeArticleResponse,
  ShareArticleRequest,
  ShareArticleResponse,
  GetAuthorArticlesParams,
} from './types';

export async function listArticles(params?: ListArticlesParams): Promise<ArticlesResponse> {
  return api.get<ArticlesResponse>('/articles', params);
}

export async function getArticle(id: string): Promise<ArticleResponse> {
  return api.get<ArticleResponse>(`/articles/${id}`);
}

export async function likeArticle(id: string): Promise<LikeArticleResponse> {
  return api.post<LikeArticleResponse>(`/articles/${id}/like`, { id });
}

export async function shareArticle(id: string, platform: string): Promise<ShareArticleResponse> {
  return api.post<ShareArticleResponse>(`/articles/${id}/share`, { id, platform });
}

export async function getAuthorArticles(params: GetAuthorArticlesParams): Promise<ArticlesResponse> {
  return api.get<ArticlesResponse>(`/articles/author/${params.authorId}`, params);
}
