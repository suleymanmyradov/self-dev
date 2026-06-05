/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 */

/** Path prefix every gateway route lives under. */
const API_PREFIX = '/api/v1';

/**
 * Normalize the configured gateway location to a bare origin.
 * Accepts values with or without a trailing `/api/v1` (or trailing slash) so a
 * misconfigured env var can't produce a doubled `/api/v1/api/v1` prefix.
 */
function normalizeGatewayOrigin(raw: string): string {
  return raw.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
}

const gatewayOrigin = normalizeGatewayOrigin(
  process.env.NEXT_PUBLIC_API_PROXY_URL || 'http://localhost:8080',
);

export const config = {
  // Same-origin path the browser hits; proxied to the gateway by the BFF route.
  apiUrl: process.env.NEXT_PUBLIC_API_URL || API_PREFIX,
  // Gateway ORIGIN (no /api/v1 suffix) — for server-side / BFF use only.
  apiProxyUrl: gatewayOrigin,
  // Path prefix shared by all gateway routes.
  apiPrefix: API_PREFIX,

  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appEnv: process.env.NODE_ENV || 'development',
  
  // Feature Flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
  },
} as const;

/**
 * Check if we're in development mode
 */
export const isDev = config.appEnv === 'development';

/**
 * Check if we're in production mode
 */
export const isProd = config.appEnv === 'production';

/**
 * Get full API URL for a given path
 */
export function getApiUrl(path: string = ''): string {
  const base = config.apiUrl;
  return path ? `${base}${path.startsWith('/') ? path : `/${path}`}` : base;
}

/**
 * Build an absolute gateway URL (origin + /api/v1 + path).
 * Server-side / BFF use only — never expose this to the browser.
 */
export function gatewayUrl(path: string = ''): string {
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${config.apiProxyUrl}${config.apiPrefix}${p}`;
}
