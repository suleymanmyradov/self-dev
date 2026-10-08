'use client';

/**
 * Post-auth redirect target storage. When an anonymous user hits an auth gate
 * (e.g. "Subscribe" on /pricing), the gate links to /login?redirect=<path>.
 * Storing the sanitized target in a short-lived cookie lets it survive the
 * Google OAuth round trip, which drops the query string.
 */

import { safeRedirectPath } from '@/lib/safe-redirect';

const REDIRECT_COOKIE = 'post_auth_redirect';
const MAX_AGE_SECONDS = 600; // 10 minutes — same bound as the OAuth state cookie.

/**
 * Accepts only same-origin absolute paths — the redirect must never send the
 * user off-site (open-redirect phishing vector). See safeRedirectPath.
 */
export function sanitizeRedirect(raw: string | null | undefined): string | null {
    return safeRedirectPath(raw);
}

export function storePostAuthRedirect(path: string): void {
    if (typeof document === 'undefined') return;
    const safe = sanitizeRedirect(path);
    if (!safe) return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${REDIRECT_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function consumePostAuthRedirect(): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${REDIRECT_COOKIE}=`;
    const entry = document.cookie.split('; ').find((c) => c.startsWith(prefix));
    const value = entry ? sanitizeRedirect(decodeURIComponent(entry.slice(prefix.length))) : null;
    // Expire immediately regardless of whether a value was found.
    document.cookie = `${REDIRECT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return value;
}
