/**
 * Validates a user-supplied redirect target (?redirect=, post-auth cookie).
 * Shared by the proxy (server) and the login flow (client), so it must stay
 * free of browser- and server-only APIs.
 */

// Placeholder origin used only to resolve the path; never navigated to.
const PARSE_BASE = 'https://redirect.invalid';

/**
 * Returns the same-origin path (pathname + search + hash) for `raw`, or null
 * when it could leave the site. A prefix check alone is not enough: the URL
 * parser strips tab/newline characters, so `/\t/evil.com` passes a
 * "starts with / but not //" test yet resolves to `//evil.com`. Resolving
 * against a fixed origin and requiring it to survive catches that, plus
 * protocol-relative (`//evil.com`) and backslash (`/\evil.com`) forms.
 */
export function safeRedirectPath(raw: string | null | undefined): string | null {
    if (!raw || !raw.startsWith('/')) return null;
    // Control characters have no place in a path; reject before parsing.
    if (/[\u0000-\u001f\u007f\\]/.test(raw)) return null;
    let url: URL;
    try {
        url = new URL(raw, PARSE_BASE);
    } catch {
        return null;
    }
    if (url.origin !== PARSE_BASE) return null;
    return url.pathname + url.search + url.hash;
}
