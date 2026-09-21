/**
 * Cookie / storage consent state (docs/app-identity-environment-matrix.md §5).
 *
 * Two categories:
 * - `necessary` — always on; required for auth/session and app preferences.
 *   Never toggleable.
 * - `analytics` — product analytics (e.g. PostHog). Opt-in in EU/EEA + UK,
 *   opt-out elsewhere. This app currently treats it as opt-in everywhere:
 *   no decision means analytics stays off (matching the Privacy Policy —
 *   "off by default and only run if you opt in"). NEXT_PUBLIC_ENABLE_ANALYTICS
 *   is also still false, so nothing non-essential runs today regardless.
 *
 * The decision is stored in BOTH places:
 * - localStorage (`CONSENT_STORAGE_KEY`) — primary client-side source of truth.
 * - a `evolella_consent` cookie — so Server Components / Route Handlers can read
 *   the decision via `await cookies()` + `parseConsentCookie` (see below).
 *
 * The record is versioned: bumping `CONSENT_VERSION` (e.g. when a new consent
 * category is added) makes older decisions read as "undecided", which
 * re-prompts the banner.
 */

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'evolella.consent';
export const CONSENT_COOKIE_NAME = 'evolella_consent';

/**
 * Window event that re-opens the consent card even after a decision was made.
 * Dispatched by `openConsentPreferences` (the "Cookie settings" entry points),
 * listened for by the `CookieConsent` component.
 */
export const CONSENT_OPEN_EVENT = 'consent:open-preferences';

/** One year in seconds — how long a recorded decision is remembered. */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface ConsentState {
    /** Always true — required storage (session, preferences). Not toggleable. */
    necessary: true;
    /** Product analytics consent. Gate future analytics code on this flag. */
    analytics: boolean;
    /** `CONSENT_VERSION` at the time the decision was recorded. */
    version: number;
    /** ISO-8601 timestamp of when the decision was recorded. */
    decidedAt: string;
}

/** The toggleable part of a consent decision — extend when adding categories. */
export interface ConsentChoices {
    analytics: boolean;
}

/* ─── Storage helpers ─────────────────────────────────────────────────────── */

function storageGet(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        // localStorage unavailable (private mode, disabled storage) — the
        // cookie copy still lets the decision be read.
        return null;
    }
}

function storageSet(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // ignore — cookie is the fallback
    }
}

function storageRemove(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

function readConsentCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${CONSENT_COOKIE_NAME}=`;
    const entry = document.cookie.split('; ').find(c => c.startsWith(prefix));
    return entry ? entry.slice(prefix.length) : null;
}

function writeConsentCookie(serialized: string): void {
    if (typeof document === 'undefined') return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
        `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}` +
        `; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearConsentCookie(): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Raw serialized decision: localStorage first, cookie as fallback. */
function readStored(): string | null {
    const local = storageGet(CONSENT_STORAGE_KEY);
    if (local) return local;
    const cookieRaw = readConsentCookie();
    if (!cookieRaw) return null;
    try {
        return decodeURIComponent(cookieRaw);
    } catch {
        return null;
    }
}

/* ─── Parse / validate ────────────────────────────────────────────────────── */

function parseConsent(raw: string | null | undefined): ConsentState | null {
    if (!raw) return null;
    try {
        const value = JSON.parse(raw) as Partial<ConsentState> | null;
        if (
            value &&
            value.necessary === true &&
            typeof value.analytics === 'boolean' &&
            value.version === CONSENT_VERSION &&
            typeof value.decidedAt === 'string'
        ) {
            return value as ConsentState;
        }
        // Unknown shape or a stale consent version → treat as undecided.
        return null;
    } catch {
        return null;
    }
}

/**
 * Parse the value of the `evolella_consent` cookie into a `ConsentState`.
 * Returns null when missing, malformed, or recorded under an older
 * `CONSENT_VERSION`.
 *
 * Server-side usage (Next 16 — `cookies()` is async):
 *   const store = await cookies();
 *   const consent = parseConsentCookie(store.get(CONSENT_COOKIE_NAME)?.value);
 */
export function parseConsentCookie(raw: string | null | undefined): ConsentState | null {
    if (!raw) return null;
    try {
        return parseConsent(decodeURIComponent(raw));
    } catch {
        return null;
    }
}

/* ─── Cached snapshot + subscription (for useSyncExternalStore) ───────────── */

// The parsed state is cached by its serialized form so `getConsent` returns a
// stable reference between calls — required by useSyncExternalStore.
let readOnce = false;
let lastRaw: string | null = null;
let lastParsed: ConsentState | null = null;

const listeners = new Set<() => void>();

function notify(): void {
    listeners.forEach(listener => listener());
}

/**
 * Current consent decision, or null when the user has not decided for the
 * current `CONSENT_VERSION` yet. Safe to call on the server (returns null).
 */
export function getConsent(): ConsentState | null {
    if (typeof window === 'undefined') return null;
    const raw = readStored();
    if (readOnce && raw === lastRaw) return lastParsed;
    readOnce = true;
    lastRaw = raw;
    lastParsed = parseConsent(raw);
    return lastParsed;
}

/** Subscribe to consent changes — same-tab writes and cross-tab `storage` events. */
export function subscribeConsent(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
        // `key === null` means another tab cleared storage entirely.
        if (e.key === CONSENT_STORAGE_KEY || e.key === null) listener();
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
    }
    return () => {
        listeners.delete(listener);
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', onStorage);
        }
    };
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

/**
 * Record a consent decision. Stamps the current `CONSENT_VERSION` and a fresh
 * `decidedAt` timestamp, persists to localStorage + the consent cookie, and
 * notifies subscribers. Also used for withdrawal — pass `{ analytics: false }`.
 */
export function setConsent(choices: ConsentChoices): ConsentState {
    const state: ConsentState = {
        necessary: true,
        analytics: choices.analytics,
        version: CONSENT_VERSION,
        decidedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(state);
        storageSet(CONSENT_STORAGE_KEY, serialized);
        writeConsentCookie(serialized);
        readOnce = true;
        lastRaw = serialized;
        lastParsed = state;
        notify();
    }
    return state;
}

/**
 * Forget the recorded decision entirely (localStorage + cookie). The consent
 * banner will prompt again. Withdrawal usually means `setConsent({ analytics:
 * false })` instead — this reset exists for the "re-open the banner" flow.
 */
export function resetConsent(): void {
    if (typeof window === 'undefined') return;
    storageRemove(CONSENT_STORAGE_KEY);
    clearConsentCookie();
    readOnce = true;
    lastRaw = null;
    lastParsed = null;
    notify();
}

/** True once the user has recorded any decision for the current version. */
export function hasConsentDecision(): boolean {
    return getConsent() !== null;
}

/**
 * Gate for non-essential analytics storage/tracking. Future analytics code
 * must check this — in addition to `config.features.enableAnalytics` — before
 * initializing a SDK or sending an event. Non-hook equivalent of
 * `useConsent().analyticsAllowed`.
 */
export function hasAnalyticsConsent(): boolean {
    return getConsent()?.analytics === true;
}

/** Re-open the consent preferences card (e.g. from a "Cookie settings" link). */
export function openConsentPreferences(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
