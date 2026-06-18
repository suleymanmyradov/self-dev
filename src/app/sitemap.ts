import type { MetadataRoute } from 'next';

import { listArticlesCached } from '@/api/server-cache';
import { config } from '@/lib/config';

const STATIC_ROUTES = ['/', '/login', '/register', '/pricing', '/explore'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.appUrl.replace(/\/+$/, '');

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));

  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    const response = await listArticlesCached({ limit: 100 });
    articleUrls = response.data.map((article) => ({
      url: `${baseUrl}/article/${article.id}`,
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch {
    // If articles fetch fails, return just the static routes.
  }

  return [...staticUrls, ...articleUrls];
}
