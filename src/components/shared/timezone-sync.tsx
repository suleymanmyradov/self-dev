'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { useHydrated } from '@/hooks/use-hydrated';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import {
    formatTimezoneLabel,
    getBrowserTimezone,
    getTimezonePromptRecord,
    recordTimezonePrompt,
} from '@/lib/timezone';

const TOAST_ID = 'timezone-sync';

/**
 * One-time timezone sync prompt — mounted once in the root layout.
 *
 * When the device's IANA zone (`Intl.DateTimeFormat().resolvedOptions()`)
 * differs from `settings.timezone`, shows a persistent toast asking the user
 * to update. The answer is recorded in localStorage keyed by the detected
 * zone, so each mismatch is only asked about once — dismissals don't suppress
 * prompts for a different zone later (e.g. travel).
 *
 * Inert unless the user is authenticated and settings have loaded.
 */
export function TimezoneSync() {
    const hydrated = useHydrated();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { data: settings } = useSettings(undefined, isAuthenticated);
    const { mutate: updateSettings } = useUpdateSettings();
    // Guards against StrictMode double-effects and re-renders re-firing the toast.
    const promptedRef = useRef(false);

    const browserTz = hydrated ? getBrowserTimezone() : null;
    const storedTz = settings?.timezone;
    const mismatch =
        !!browserTz && storedTz !== undefined && browserTz !== storedTz;
    const alreadyPrompted =
        !!browserTz && getTimezonePromptRecord()?.timezone === browserTz;

    useEffect(() => {
        if (!hydrated || !isAuthenticated || promptedRef.current) return;
        if (!mismatch || alreadyPrompted || !browserTz) return;
        promptedRef.current = true;

        toast(`Your device is in ${formatTimezoneLabel(browserTz)}`, {
            id: TOAST_ID,
            description: `Update your time zone from ${storedTz ? formatTimezoneLabel(storedTz) : 'UTC'} so reminders fire at the right local time?`,
            duration: Infinity,
            action: {
                label: 'Update',
                onClick: () => {
                    recordTimezonePrompt(browserTz, 'updated');
                    updateSettings({ timezone: browserTz });
                },
            },
            cancel: {
                label: 'Keep current',
                onClick: () => recordTimezonePrompt(browserTz, 'dismissed'),
            },
            // Closing via X/swipe counts as dismissal — but don't overwrite an
            // 'updated' record (sonner fires onDismiss after the action runs).
            onDismiss: () => {
                if (getTimezonePromptRecord()?.timezone !== browserTz) {
                    recordTimezonePrompt(browserTz, 'dismissed');
                }
            },
        });
    }, [
        hydrated,
        isAuthenticated,
        mismatch,
        alreadyPrompted,
        browserTz,
        storedTz,
        updateSettings,
    ]);

    return null;
}
