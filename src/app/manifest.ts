import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evolella',
    short_name: 'Evolella',
    description: 'Build better habits with an AI coach that keeps you accountable.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5ef',
    theme_color: '#f7f5ef',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
