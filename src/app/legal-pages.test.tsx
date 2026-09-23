import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyPolicyPage from '@/app/privacy/page';
import TermsPage from '@/app/terms/page';

const renderPage = (page: typeof PrivacyPolicyPage) => renderToStaticMarkup(createElement(page));
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Legal page implementation disclosures', () => {
    it('discloses scheduled retention separately from account deletion and backups', () => {
        const copy = text(renderPage(PrivacyPolicyPage));
        for (const value of [
            '05:45 UTC',
            'older than 90 days are hard-deleted',
            '12 months (365 days)',
            '30 days',
            'Account-lifetime content',
            'seven-day retention setting',
            'does not itself delete older remote copies',
            'Expiry of an export download link does not delete the stored file',
        ])
            expect(copy).toContain(value);
    });
    it('describes the real export categories and limitations', () => {
        const copy = text(renderPage(PrivacyPolicyPage));
        for (const value of [
            'weekly reviews, saved items, activity history, settings, coaching profile and notifications',
            '15 minutes',
            'conversations, long-term memory facts, plans, reports and uploaded files are not included',
            '1,000 records',
            'capped at 50',
            'section may be omitted',
        ])
            expect(copy).toContain(value);
    });
    it('identifies providers without obsolete hosting or payment claims', () => {
        const html = renderPage(PrivacyPolicyPage);
        const copy = text(html);
        for (const value of [
            'OpenAI-compatible',
            'Resend',
            'Sentry',
            'Paddle',
            'RevenueCat',
            'Cloudflare R2',
            'Expo',
            'PostHog product analytics is not currently enabled',
            'evolella.consent',
            'evolella_consent',
            'production Web Vitals reporting currently sends no metrics',
            'not disabled by this consent control',
        ])
            expect(copy).toContain(value);
        expect(copy).not.toMatch(/Amazon Web Services|Stripe|private cloud environment/);
        expect(html).toContain('Cookie settings</button>');
        expect(html).toContain('href="/terms"');
    });
    it('discloses hard deletion, asynchronous cleanup and remaining gaps', () => {
        const copy = text(renderPage(PrivacyPolicyPage));
        for (const value of [
            'hard-deletes the user record',
            'asynchronous cleanup',
            'successful event delivery and processing',
            'verify and complete their account-deletion cleanup',
            'does not itself cancel a subscription',
        ])
            expect(copy).toContain(value);
    });
    it('marks unresolved legal details instead of inventing them on either page', () => {
        for (const page of [PrivacyPolicyPage, TermsPage]) {
            const html = renderPage(page);
            const copy = text(html);
            expect(copy).toContain('September 23, 2026');
            expect(copy).toContain('Draft — owner confirmation required.');
            expect(copy).toContain(
                'OWNER TO CONFIRM: full legal name, registered address, and country of establishment',
            );
            expect(copy).toContain('not ready for publication');
            expect(html).not.toContain('mailto:');
        }
    });
    it('uses conditional web/mobile billing and provider-specific cancellation in terms', () => {
        const html = renderPage(TermsPage);
        const copy = text(html);
        for (const value of [
            'When web payments are enabled',
            'Paddle',
            'When mobile subscriptions are enabled',
            'RevenueCat',
            'does not itself cancel an external subscription',
            'refund and withdrawal policy',
            'governing law, jurisdiction and courts',
            'Registration does not currently verify your age',
        ])
            expect(copy).toContain(value);
        expect(copy).not.toContain('Stripe');
        expect(html).toContain('href="/privacy"');
    });
});
