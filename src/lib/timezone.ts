/**
 * Browser timezone detection + the one-time "update your time zone?" prompt
 * record. `settings.timezone` (IANA id) drives server-side habit streaks and
 * reminder scheduling, so when the device's zone differs we ask the user once
 * — per detected zone — whether to update. The record lives in localStorage:
 * dismissing "Europe/London" doesn't suppress a later "Asia/Tokyo" prompt
 * (e.g. after travel).
 */

export const TIMEZONE_PROMPT_STORAGE_KEY = 'evolella.timezone-prompt';

export interface TimezonePromptRecord {
    /** The detected IANA zone the prompt was shown for. */
    timezone: string;
    action: 'updated' | 'dismissed';
    /** ISO-8601 timestamp of when the user answered. */
    at: string;
}

/** The device's IANA timezone (e.g. "Europe/Berlin"), or null if unavailable. */
export function getBrowserTimezone(): string | null {
    if (typeof Intl === 'undefined') return null;
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return typeof tz === 'string' && tz.length > 0 ? tz : null;
    } catch {
        return null;
    }
}

/**
 * True when `tz` is a usable IANA timezone name ("Europe/Berlin", "UTC").
 * Mirrors the backend's validator.IsValidTimezone — invalid values are
 * rejected on write because they would poison `AT TIME ZONE` queries.
 */
export function isValidTimezone(timezone: string): boolean {
    if (!timezone) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

/**
 * Human label for an IANA zone: "Europe/Berlin" → "Berlin (UTC+02:00)".
 * Mirrors the label format used by TimezoneCombobox. Falls back to the raw id.
 */
export function formatTimezoneLabel(timezone: string): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        }).formatToParts(new Date());
        const longOffset =
            parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0';
        const offset = longOffset.replace(/^GMT/, '').trim() || '+00:00';
        const city = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
        return `${city} (UTC${offset})`;
    } catch {
        return timezone;
    }
}

/** The recorded prompt answer, or null if never asked / malformed. */
export function getTimezonePromptRecord(): TimezonePromptRecord | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(TIMEZONE_PROMPT_STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw) as Partial<TimezonePromptRecord> | null;
        if (
            value &&
            typeof value.timezone === 'string' &&
            (value.action === 'updated' || value.action === 'dismissed') &&
            typeof value.at === 'string'
        ) {
            return value as TimezonePromptRecord;
        }
        return null;
    } catch {
        return null;
    }
}

/** Persist that the prompt was answered for `timezone` (update or dismiss). */
export function recordTimezonePrompt(
    timezone: string,
    action: TimezonePromptRecord['action']
): void {
    if (typeof window === 'undefined') return;
    try {
        const record: TimezonePromptRecord = {
            timezone,
            action,
            at: new Date().toISOString(),
        };
        window.localStorage.setItem(
            TIMEZONE_PROMPT_STORAGE_KEY,
            JSON.stringify(record)
        );
    } catch {
        // Storage unavailable (private mode) — worst case the prompt shows again.
    }
}
