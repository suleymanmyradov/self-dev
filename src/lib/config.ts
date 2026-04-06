/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 */

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  apiProxyUrl: process.env.NEXT_PUBLIC_API_PROXY_URL || 'http://localhost:8080/api/v1',
  
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
