import { gatewayUrl } from './config';

/**
 * Single-flight refresh-token coordinator.
 *
 * The backend rotates the refresh token on every successful /auth/refresh —
 * the old token is single-use. When several requests race on an expired
 * access token (parallel API calls, navigation + hydration, server-component
 * renders), they would each POST /auth/refresh carrying the SAME refresh
 * token: one wins rotation, the rest get 401 — and the losers then delete
 * the cookies the winner just set, logging the user out.
 *
 * This coordinator makes every caller holding the same refresh token share
 * one result: callers that arrive while an exchange is in flight await the
 * same promise, and callers that arrive shortly after (their browser cookie
 * jar hadn't yet received the rotated pair) get the cached result.
 *
 * proxy.ts, route.ts, and server-api.ts all run in the Node.js runtime, so
 * this module state is shared per server process.
 */

export type RefreshOutcome =
  | { kind: 'ok'; accessToken: string; refreshToken: string }
  /** The presented refresh token was rejected (401/403) — it is dead. */
  | { kind: 'rejected' }
  /** Network error, 5xx, or malformed body — token state is unknown. */
  | { kind: 'unavailable' };

/**
 * How long a completed exchange stays cached under the presented (now-dead)
 * refresh token. Stragglers holding the pre-rotation token within this window
 * reuse the same pair instead of triggering a second rotation. Deliberately
 * short — a longer window would widen the replay surface for a stolen token.
 */
const GRACE_MS = 30_000;

const MAX_ENTRIES = 512;

interface CacheEntry {
  outcome: Promise<RefreshOutcome>;
  expiresAt: number;
}

const exchanges = new Map<string, CacheEntry>();

function prune() {
  if (exchanges.size <= MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of exchanges) {
    if (entry.expiresAt <= now) exchanges.delete(key);
  }
  // Still over the cap: the map is insertion-ordered, drop the oldest.
  while (exchanges.size > MAX_ENTRIES) {
    const oldest = exchanges.keys().next();
    if (oldest.done) break;
    exchanges.delete(oldest.value);
  }
}

async function doExchange(refreshToken: string): Promise<RefreshOutcome> {
  try {
    const res = await fetch(gatewayUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (res.status === 401 || res.status === 403) return { kind: 'rejected' };
    if (!res.ok) return { kind: 'unavailable' };
    const data = (await res.json().catch(() => null)) as
      | { accessToken?: string; refreshToken?: string }
      | null;
    if (!data?.accessToken || !data?.refreshToken) return { kind: 'unavailable' };
    return {
      kind: 'ok',
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch {
    return { kind: 'unavailable' };
  }
}

/**
 * Exchange a refresh token for a fresh pair, sharing one in-flight exchange
 * across concurrent callers and replaying the completed result to stragglers
 * within the grace window.
 */
export function exchangeRefreshToken(refreshToken: string): Promise<RefreshOutcome> {
  const existing = exchanges.get(refreshToken);
  if (existing) {
    if (existing.expiresAt > Date.now()) return existing.outcome;
    exchanges.delete(refreshToken);
  }

  const outcome = doExchange(refreshToken);
  exchanges.set(refreshToken, {
    outcome,
    expiresAt: Date.now() + GRACE_MS,
  });
  void outcome.then(prune, prune);
  return outcome;
}

/**
 * Look up an in-flight or recently-completed exchange WITHOUT starting one.
 * Used by server components (server-api.ts): they cannot persist rotated
 * cookies to the browser, so initiating a rotation here would burn the
 * single-use refresh token — the new pair would be lost and the session
 * killed. Awaiting an exchange already started by a cookie-writing caller
 * (proxy or BFF route) is safe: that caller persists the pair.
 */
export function peekRefreshToken(
  refreshToken: string,
): Promise<RefreshOutcome> | null {
  const existing = exchanges.get(refreshToken);
  if (!existing || existing.expiresAt <= Date.now()) return null;
  return existing.outcome;
}

/** Test hook — clears all cached exchanges. */
export function resetRefreshCoordinatorForTests(): void {
  exchanges.clear();
}
