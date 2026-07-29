import type { MetadataRoute } from 'next';

import { config } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = config.appUrl.replace(/\/+$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/me/', '/onboarding/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

