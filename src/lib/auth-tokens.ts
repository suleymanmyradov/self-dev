/**
 * Client-only auth token management module.
 * Tokens are held only in a module-level variable (memory-only, never persisted).
 * This module must NOT be used to store per-user state on the server.
 */

type TokenState = {
  accessToken: string | null;
  refreshToken: string | null;
};

let tokens: TokenState = {
  accessToken: null,
  refreshToken: null,
};

export function getAccessToken(): string | null {
  return tokens.accessToken;
}

export function getRefreshToken(): string | null {
  return tokens.refreshToken;
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') {
    // Safety guard: never store per-user state in module scope on the server.
    return;
  }
  tokens = { accessToken, refreshToken };
}

export function clearTokens(): void {
  tokens = { accessToken: null, refreshToken: null };
}
