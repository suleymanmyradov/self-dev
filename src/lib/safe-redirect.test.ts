import { describe, expect, it } from 'vitest';

import { safeRedirectPath } from './safe-redirect';
import { safeRedirectTarget } from '../proxy';

describe('safeRedirectPath', () => {
    it.each([
        ['/', '/'],
        ['/plan', '/plan'],
        ['/progress?tab=week', '/progress?tab=week'],
        ['/progress#review', '/progress#review'],
        ['/login?redirect=%2Fplan', '/login?redirect=%2Fplan'],
    ])('keeps same-origin path %s', (raw, want) => {
        expect(safeRedirectPath(raw)).toBe(want);
    });

    it.each([
        ['empty', ''],
        ['null', null],
        ['undefined', undefined],
        ['relative path', 'plan'],
        ['absolute URL', 'https://evil.com'],
        ['javascript scheme', 'javascript:alert(1)'],
        ['protocol-relative', '//evil.com'],
        ['backslash host', '/\\evil.com'],
        ['backslash after slashes', '/\\/evil.com'],
        // The URL parser strips tab/newline, turning these into //evil.com.
        ['tab between slashes', '/\t/evil.com'],
        ['newline between slashes', '/\n/evil.com'],
        ['carriage return between slashes', '/\r/evil.com'],
        ['leading tab', '\t//evil.com'],
        ['NUL byte', '/\u0000/evil.com'],
        ['DEL byte', '/\u007f/evil.com'],
    ])('rejects %s', (_name, raw) => {
        expect(safeRedirectPath(raw)).toBeNull();
    });

    it('rejects decoded ?redirect= payloads that hide //', () => {
        // What searchParams.get returns for ?redirect=/%09/evil.com
        const decoded = new URLSearchParams('redirect=/%09/evil.com').get('redirect');
        expect(safeRedirectPath(decoded)).toBeNull();
    });
});

describe('safeRedirectTarget (proxy)', () => {
    it('falls back to /plan for unsafe or missing targets', () => {
        expect(safeRedirectTarget(null)).toBe('/plan');
        expect(safeRedirectTarget('//evil.com')).toBe('/plan');
        expect(safeRedirectTarget('/\t/evil.com')).toBe('/plan');
    });

    it('follows a safe target', () => {
        expect(safeRedirectTarget('/progress')).toBe('/progress');
    });

    it('never resolves off-origin when used as a redirect URL', () => {
        const base = 'https://app.evolella.com/login';
        for (const raw of ['/\t/evil.com', '/\n/evil.com', '//evil.com', '/\\evil.com']) {
            expect(new URL(safeRedirectTarget(raw), base).origin).toBe('https://app.evolella.com');
        }
    });
});
