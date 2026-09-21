'use client';

import { cn } from '@/lib/utils';
import { openConsentPreferences } from '@/lib/consent';

/**
 * Text-button entry point that re-opens the cookie consent card so the user
 * can review or withdraw consent. Used on the public /privacy page — the
 * in-app equivalent lives under Settings → Data & privacy.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={openConsentPreferences}
            className={cn('underline', className)}
        >
            Cookie settings
        </button>
    );
}
