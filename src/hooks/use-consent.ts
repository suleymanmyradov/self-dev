import { useSyncExternalStore } from 'react';
import {
    getConsent,
    openConsentPreferences,
    resetConsent,
    setConsent,
    subscribeConsent,
    type ConsentState,
} from '@/lib/consent';

// SSR snapshot: consent lives in the browser, so the server always reads as
// "undecided". Hydration matches this, then the real value is picked up.
function getServerSnapshot(): ConsentState | null {
    return null;
}

/**
 * Reactive access to the user's cookie/storage consent decision.
 *
 * `consent` is null while no decision exists for the current `CONSENT_VERSION`
 * — the `CookieConsent` banner uses this to decide whether to show. Future
 * analytics code should gate on `analyticsAllowed` (or the non-hook
 * `hasAnalyticsConsent()` in '@/lib/consent' outside of React).
 */
export function useConsent() {
    const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerSnapshot);

    return {
        /** The recorded decision, or null when undecided / stale version. */
        consent,
        /** True once the user has recorded a decision for the current version. */
        hasDecided: consent !== null,
        /** Gate for product analytics — true only after explicit opt-in. */
        analyticsAllowed: consent?.analytics === true,
        setConsent,
        resetConsent,
        openConsentPreferences,
    };
}
