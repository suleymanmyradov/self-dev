// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import {
    formatTimezoneLabel,
    getBrowserTimezone,
    getTimezonePromptRecord,
    recordTimezonePrompt,
    TIMEZONE_PROMPT_STORAGE_KEY,
} from './timezone';

beforeEach(() => {
    window.localStorage.clear();
});

describe('getBrowserTimezone', () => {
    it('returns the device IANA zone', () => {
        const expected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        expect(getBrowserTimezone()).toBe(expected);
    });
});

describe('formatTimezoneLabel', () => {
    it('renders "City (UTC±HH:MM)" for a region zone', () => {
        expect(formatTimezoneLabel('Europe/Berlin')).toMatch(
            /^Berlin \(UTC[+-]\d{2}:\d{2}\)$/
        );
    });

    it('handles zones without a region prefix', () => {
        expect(formatTimezoneLabel('UTC')).toBe('UTC (UTC+00:00)');
    });

    it('falls back to the raw value for invalid zones', () => {
        expect(formatTimezoneLabel('Not/AZone')).toBe('Not/AZone');
    });
});

describe('timezone prompt record', () => {
    it('returns null when nothing was recorded', () => {
        expect(getTimezonePromptRecord()).toBeNull();
    });

    it('round-trips a recorded answer', () => {
        recordTimezonePrompt('Asia/Tokyo', 'dismissed');
        const record = getTimezonePromptRecord();
        expect(record?.timezone).toBe('Asia/Tokyo');
        expect(record?.action).toBe('dismissed');
        expect(record?.at).toEqual(expect.any(String));
    });

    it('returns null for malformed stored values', () => {
        window.localStorage.setItem(TIMEZONE_PROMPT_STORAGE_KEY, '{oops');
        expect(getTimezonePromptRecord()).toBeNull();

        window.localStorage.setItem(
            TIMEZONE_PROMPT_STORAGE_KEY,
            JSON.stringify({ timezone: 'Asia/Tokyo' })
        );
        expect(getTimezonePromptRecord()).toBeNull();
    });
});
