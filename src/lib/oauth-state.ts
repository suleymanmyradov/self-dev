'use client';

/**
 * OAuth `state` parameter storage. The Google sign-in button generates a
 * random state, persists it in a short-lived cookie, and sends it to Google;
 * the callback page then compares the state Google echoed back against the
 * stored value to prevent login CSRF (an attacker can't forge a callback URL
 * with a valid code+state pair for another session).
 *
 * A cookie is used instead of sessionStorage so the value also survives flows
 * where the browser hands the redirect to a fresh tab context.
 */

const STATE_COOKIE = 'google_oauth_state';
const MAX_AGE_SECONDS = 600; // 10 minutes — generous bound for the consent round trip.

export function storeOAuthState(state: string): void {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${STATE_COOKIE}=${encodeURIComponent(state)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/**
 * Reads the stored state and clears it. Consume-on-read means a replayed
 * callback URL (same state param) fails verification on the second visit.
 */
export function consumeOAuthState(): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${STATE_COOKIE}=`;
  const entry = document.cookie
    .split('; ')
    .find((c) => c.startsWith(prefix));
  const value = entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
  // Expire immediately regardless of whether a value was found.
  document.cookie = `${STATE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  return value;
}
