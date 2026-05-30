import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },
    poweredByHeader: false,
    compress: true,
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_PROXY_URL || 'http://localhost:9999';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
