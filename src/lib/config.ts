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

// AI-gateway origin — a separate API service that owns AI/streaming routes
// (coaching, weekly reviews, conversations, voice). In production both services
// share a single public origin via ingress path-prefix routing; in local dev
// they run on separate ports. Defaults to gateway port + 1 (8889 if gateway is
// 8888). Set NEXT_PUBLIC_AI_GATEWAY_URL to override.
const aiGatewayOrigin = normalizeGatewayOrigin(
  process.env.NEXT_PUBLIC_AI_GATEWAY_URL || '',
);

export const config = {
  // Same-origin path the browser hits; proxied to the gateway by the BFF route.
  apiUrl: process.env.NEXT_PUBLIC_API_URL || API_PREFIX,
  // Gateway ORIGIN (no /api/v1 suffix) — for server-side / BFF use only.
  apiProxyUrl: gatewayOrigin,
  // AI-gateway ORIGIN (no /api/v1 suffix) — for server-side / BFF use only.
  // Empty string means "same as gateway" (production ingress or single-service).
  aiGatewayUrl: aiGatewayOrigin,
  // Path prefix shared by all gateway routes.
  apiPrefix: API_PREFIX,

  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appEnv: process.env.NODE_ENV || 'development',

  // Google OAuth (public client ID — safe to expose; the client secret stays
  // server-side in the auth microservice). Empty client ID disables the button.
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  googleRedirectUri:
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google`,

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

/**
 * Path prefixes owned by the ai-gateway service. The BFF proxy uses this to
 * route requests to the correct backend in local dev (where the two services
 * run on separate ports). In production, ingress handles this and
 * `aiGatewayUrl` can be empty (same origin).
 *
 * Keep this list in sync with the route groups in
 * `services/ai-gateway/contract/main.api`.
 */
const AI_GATEWAY_PATH_PREFIXES = [
  '/personalization/coaching',
  '/personalization/coaching-stream',
  '/personalization/onboarding-habits',
  '/personalization/transcribe',
  '/personalization/voice-turn',
  '/weekly-reviews/generate',
  '/weekly-reviews/generate-stream',
  '/conversations',
];

/**
 * Whether a given API path (without the /api/v1 prefix) should be routed to
 * the ai-gateway instead of the main gateway.
 */
export function isAiGatewayPath(path: string): boolean {
  if (!config.aiGatewayUrl) return false;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return AI_GATEWAY_PATH_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Build an absolute URL for the correct backend service (gateway or ai-gateway)
 * for a given API path. Server-side / BFF use only.
 */
export function backendUrl(path: string = '', search: string = ''): string {
  const p = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const origin = isAiGatewayPath(p) ? config.aiGatewayUrl : config.apiProxyUrl;
  return `${origin}${config.apiPrefix}${p}${search}`;
}
