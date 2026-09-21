'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CONSENT_OPEN_EVENT } from '@/lib/consent';
import { useConsent } from '@/hooks/use-consent';
import { useHydrated } from '@/hooks/use-hydrated';

/**
 * Non-blocking cookie consent card — mounted once in the root layout.
 *
 * Shows as a dismissible bottom card until the user records a decision
 * (Accept all / Reject non-essential / Customize). After deciding it stays
 * hidden, but re-opens whenever `openConsentPreferences()` fires
 * `CONSENT_OPEN_EVENT` (the "Cookie settings" entry points on /privacy and in
 * Settings → Data & privacy).
 *
 * Consent state lives in '@/lib/consent' — localStorage + the
 * `evolella_consent` cookie — and nothing non-essential runs until
 * `consent.analytics` is true.
 */
export function CookieConsent() {
    const { consent, hasDecided, setConsent } = useConsent();
    // Consent lives in the browser — render nothing until hydration so users
    // who already decided never see the card flash and hide.
    const hydrated = useHydrated();
    // Re-opened via a "Cookie settings" entry point after a decision exists.
    const [forceOpen, setForceOpen] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [analyticsDraft, setAnalyticsDraft] = useState(false);

    useEffect(() => {
        const onOpen = () => {
            setAnalyticsDraft(consent?.analytics ?? false);
            setCustomizing(true);
            setForceOpen(true);
        };
        window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
        return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    }, [consent?.analytics]);

    if (!hydrated) return null;
    if (!forceOpen && hasDecided) return null;

    const decide = (analytics: boolean) => {
        setConsent({ analytics });
        setForceOpen(false);
        setCustomizing(false);
    };

    const toggleCustomize = () => {
        setAnalyticsDraft(consent?.analytics ?? false);
        setCustomizing(v => !v);
    };

    return (
        <div
            role="region"
            aria-label="Cookie consent"
            className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] md:inset-x-auto md:right-6 md:bottom-6 md:w-full md:max-w-md"
        >
            <div className="rounded-xl border border-border bg-card p-4 shadow-[0_16px_48px_-16px_rgb(0_0_0/30%)]">
                <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">Cookies &amp; privacy</p>
                    {forceOpen && hasDecided && (
                        <button
                            type="button"
                            onClick={() => setForceOpen(false)}
                            aria-label="Close cookie settings"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    We use storage that keeps you signed in and remembers your preferences. With
                    your permission we&apos;d also like to collect anonymous product analytics to
                    improve Evolella. See our{' '}
                    <Link href="/privacy" className="underline underline-offset-2">
                        Privacy Policy
                    </Link>
                    .
                </p>

                {customizing && (
                    <div className="mt-3 space-y-3 rounded-lg border border-border/70 bg-background p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium">Necessary</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Sign-in and preferences — always on.
                                </p>
                            </div>
                            <Switch checked disabled aria-label="Necessary storage (always on)" />
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-medium">Product analytics</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Anonymous usage data that helps us improve the app.
                                </p>
                            </div>
                            <Switch
                                checked={analyticsDraft}
                                onCheckedChange={setAnalyticsDraft}
                                aria-label="Product analytics"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {customizing ? (
                        <Button size="sm" onClick={() => decide(analyticsDraft)}>
                            Save choices
                        </Button>
                    ) : (
                        <>
                            <Button size="sm" onClick={() => decide(true)}>
                                Accept all
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => decide(false)}>
                                Reject non-essential
                            </Button>
                        </>
                    )}
                    <Button size="sm" variant="ghost" onClick={toggleCustomize}>
                        {customizing ? 'Back' : 'Customize'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
