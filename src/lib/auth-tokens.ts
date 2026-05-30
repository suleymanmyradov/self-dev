/**
 * Standalone auth token management module.
 * Stores tokens in a module-level variable (SSR-safe, no React dependency).
 * Both the Zustand auth store and the API client can read/write from this
 * without importing each other's modules.
 */

type TokenState = {
  accessToken: string | null;
  refreshToken: string | null;
};

const AUTH_COOKIE_NAME = 'auth-token';

let tokens: TokenState = {
  accessToken: null,
  refreshToken: null,
};

// Cookie helpers — sync access token to a cookie so Next.js middleware can read it
function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  const secureFlag = location.protocol === 'https:' ? ' Secure;' : '';
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax;${secureFlag}`;
}

function removeAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return tokens.accessToken;
}

export function getRefreshToken(): string | null {
  return tokens.refreshToken;
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  tokens = { accessToken, refreshToken };
  setAuthCookie(accessToken);
}

export function clearTokens(): void {
  tokens = { accessToken: null, refreshToken: null };
  removeAuthCookie();
}
