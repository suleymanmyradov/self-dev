import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Enables the "use cache" directive, cacheTag, and cacheLife functions.
    // Pages are dynamic by default; only explicitly cached scopes are prerendered.
    cacheComponents: true,
    // Allow the dev server (HMR WebSocket, dev-only assets) to be reached from
    // LAN IPs so testing from other devices / VMs on the local network works.
    // Production is unaffected.
    allowedDevOrigins: ['127.0.0.1', '192.168.77.40', '192.168.77.*'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'example.com',
                pathname: '/images/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '9000',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        // MinIO runs on 127.0.0.1:9000 in development. Next.js 16 blocks
        // private/local IPs by default (SSRF protection); allow it so the
        // image optimizer can fetch from the local MinIO instance.
        dangerouslyAllowLocalIP: true,
    },
    poweredByHeader: false,
    compress: true,
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        ...(process.env.NODE_ENV === 'development' && {
            serverActions: {
                allowedOrigins: ['127.0.0.*'],
            },
        }),
    },
    // No /api rewrite: browser traffic goes through the same-origin BFF route
    // (src/app/api/v1/[...path]) which attaches the token cookie; SSR calls the
    // gateway directly. A transparent rewrite would bypass that token handling.
    async redirects() {
        return [
            { source: '/habits', destination: '/plan', permanent: false },
            { source: '/goals', destination: '/plan', permanent: false },
            { source: '/weekly-review', destination: '/progress', permanent: false },
            { source: '/activity', destination: '/progress', permanent: false },
            { source: '/explore', destination: '/library', permanent: false },
            { source: '/saved', destination: '/library', permanent: false },
            { source: '/search', destination: '/library', permanent: false },
            { source: '/profile', destination: '/me', permanent: false },
            { source: '/settings', destination: '/me', permanent: false },
            { source: '/pricing', destination: '/me', permanent: false },
            { source: '/ai-coach/:path*', destination: '/coach/:path*', permanent: false },
        ];
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: process.env.NODE_ENV === 'development'
                            ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: http://127.0.0.1:9000 http://localhost:9000 data: blob:; connect-src 'self' https://api.openai.com http://127.0.0.1:9000 http://localhost:9000; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
                            : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; connect-src 'self' https://api.openai.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
