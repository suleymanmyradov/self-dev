import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Self Dev AI',
    short_name: 'Self Dev',
    description: 'AI-powered personal development with coaching, therapy, and habit tracking',
    start_url: '/',
    display: 'standalone',
    background_color: '#30B0C7',
    theme_color: '#30B0C7',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
