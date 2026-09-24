import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyPolicyPage from '@/app/privacy/page';
import RefundsPage from '@/app/refunds/page';
import TermsPage from '@/app/terms/page';

const renderPage = (page: typeof PrivacyPolicyPage) => renderToStaticMarkup(createElement(page));
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Concise legal disclosures', () => {
    it('keeps meaningful retention and backup limits', () => {
        const copy = text(renderPage(PrivacyPolicyPage));
        for (const value of [
            '90 days',
            '12 months (365 days)',
            '30 days',
            '15 minutes',
            'Until account deletion',
            'daily cleanup',
            'seven-day retention period',
            'Off-site backups are not currently configured',
            'up to 30 days for Sentry error data and Resend email records',
            'do not automatically expire',
        ])
            expect(copy).toContain(value);
    });
    it('keeps material export and deletion limitations', () => {
        const copy = text(renderPage(PrivacyPolicyPage));
        for (const value of [
            'permanently delete your account',
            'conversations, saved AI memories, plans, reports and uploaded files are excluded',
            'some history or unavailable sections may be missing',
            'Completion across services can take time',
            'not yet covered by automated deletion',
            'Deleting an account does not cancel external subscriptions',
        ])
            expect(copy).toContain(value);
    });
    it('keeps AI sharing, recipients and the consent distinction', () => {
        const html = renderPage(PrivacyPolicyPage);
        const copy = text(html);
        for (const value of [
            'Google Gemini is our main AI service',
            'OpenRouter',
            'OpenAI',
            'AI providers receive relevant messages',
            'audio for transcription',
            'speech synthesis is not currently enabled',
            'Google',
            'Resend',
            'Sentry',
            'UpCloud',
            'Paddle',
            'RevenueCat',
            'Expo',
            'not currently enabled',
            'require your opt-in',
            'not disabled by this choice',
            'withdraw consent',
        ])
            expect(copy).toContain(value);
        expect(html).toContain('Cookie settings</button>');
        expect(html).toContain('href="/terms"');
    });
    it('omits infrastructure internals and obsolete provider claims', () => {
        for (const page of [PrivacyPolicyPage, TermsPage, RefundsPage]) {
            expect(text(renderPage(page))).not.toMatch(
                /05:45|PostgreSQL|MinIO|Caddy|Kafka|bcrypt|OpenAI-compatible|localStorage|evolella\.consent|evolella_consent|1,000|capped at 50|SDK|Amazon Web Services|Stripe|Cloudflare R2|OWNER ACTION REQUIRED/,
            );
        }
    });
    it('identifies the confirmed individual operator and shared contact', () => {
        for (const page of [PrivacyPolicyPage, TermsPage, RefundsPage]) {
            const html = renderPage(page);
            const copy = text(html);
            expect(copy).toContain('Evolella is operated by Suleyman Myradow');
            expect(copy).toContain('For support or privacy requests');
            expect(html).toContain('href="mailto:support@evolella.com"');
            expect(copy).not.toMatch(/\[LEGAL NAME|\[PRIVACY EMAIL\]|\[SUPPORT EMAIL\]/);
        }
    });
    it('publishes filled legal details without draft placeholders', () => {
        for (const page of [PrivacyPolicyPage, TermsPage, RefundsPage]) {
            const copy = text(renderPage(page));
            expect(copy).not.toContain('Draft.');
            expect(copy).not.toContain('CONFIRM');
            expect(copy).not.toContain('[');
        }
        for (const page of [PrivacyPolicyPage, TermsPage]) {
            expect(text(renderPage(page))).toContain('September 23, 2026');
        }
        expect(text(renderPage(RefundsPage))).toContain('September 24, 2026');
        const privacy = text(renderPage(PrivacyPolicyPage));
        expect(privacy).toContain('a postal address is available on request');
        expect(privacy).toContain('processed mainly in the United States');
        expect(text(renderPage(TermsPage))).toContain('State of Delaware');
    });
    it('distinguishes planned paid Gemini usage from current configuration', () => {
        const privacy = text(renderPage(PrivacyPolicyPage));
        expect(privacy).toContain('For launch, we plan to use Gemini with billing enabled');
        expect(privacy).toContain('paid API terms');
        expect(privacy).toContain('retention for safety and legal purposes may still apply');
        expect(privacy).not.toMatch(
            /billing is enabled|currently use paid Gemini|zero retention|never retain/i,
        );
    });
    it('states adult eligibility and in-app notices without claiming automatic verification', () => {
        const privacy = text(renderPage(PrivacyPolicyPage));
        const terms = text(renderPage(TermsPage));
        expect(privacy).toContain('adults aged 18 and over in the United States');
        expect(terms).toContain('You must be at least 18 years old');
        expect(terms).not.toContain('CONFIRM MINIMUM AGE');
        for (const copy of [privacy, terms]) {
            expect(copy).toContain('We will notify you in the app of material changes');
            expect(copy).not.toMatch(
                /CONFIRM NOTICE PROCESS|automatically verif|age-verified|automatically notif/,
            );
        }
    });
    it('keeps subscription, AI-advice and consumer-rights terms', () => {
        const html = renderPage(TermsPage);
        const copy = text(html);
        for (const value of [
            'When available',
            'Paddle',
            'RevenueCat',
            'renew automatically until cancelled',
            'Deleting your account does not cancel a subscription',
            'hosted customer portal',
            'Manage subscription link in your purchase email',
            'Refund requests for web purchases are handled through Paddle',
            'governed by the laws of the State of Delaware',
            'not medical, psychological or financial advice',
            'Mandatory consumer rights remain unaffected',
        ])
            expect(copy).toContain(value);
        expect(html).toContain('href="https://www.paddle.com/legal/refund-policy"');
        expect(copy).not.toContain('CONFIRM REFUND POLICY');
        expect(html).toContain('href="/privacy"');
    });
    it('publishes a dedicated refund and cancellation policy', () => {
        const html = renderPage(RefundsPage);
        const copy = text(html);
        for (const value of [
            'cancel your Evolella Pro subscription at any time',
            'hosted customer portal',
            'Manage billing',
            'end of the current paid period',
            'Deleting your account does not cancel a subscription',
            'merchant of record',
            '14 days',
            'Apple App Store or Google Play',
            'statutory consumer rights are unaffected',
        ])
            expect(copy).toContain(value);
        expect(html).toContain('Refund &amp; Cancellation Policy');
        expect(html).toContain('href="https://www.paddle.com/legal/refund-policy"');
        expect(html).toContain('href="/terms"');
        expect(html).toContain('href="mailto:support@evolella.com"');
    });
});
