import type { Metadata } from 'next';
import Link from 'next/link';
import { CookieSettingsButton } from '@/components/shared/cookie-settings-button';

export const metadata: Metadata = {
    title: 'Privacy Policy — Evolella',
    description:
        'How Evolella collects, uses, stores, and protects your personal data, and the rights you have over it.',
};

const UPDATED = 'September 23, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="font-display-face text-xl font-semibold tracking-tight">{title}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <main className="mx-auto w-full max-w-2xl px-4 py-12">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back
            </Link>
            <h1 className="font-display-face mt-4 text-3xl font-semibold">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {UPDATED}</p>
            <div className="mt-8 space-y-8">
                <Section title="Who we are">
                    <p>
                        Evolella is operated by Suleyman Myradow, the controller of your personal
                        data. For support or privacy requests, contact{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>
                        .
                    </p>
                    <p>
                        Evolella is intended for adults aged 18 and over in the United States. It is
                        operated by an individual; a postal address is available on request via the
                        email above.
                    </p>
                </Section>
                <Section title="What we collect and why">
                    <p>
                        We collect account and profile details, a password hash if you set a
                        password, and content you provide: habits, goals, check-ins, plans, reviews,
                        saved items, AI conversations, saved memories, uploads and support reports.
                        Google sign-in supplies your account identifier, name, email and profile
                        picture.
                    </p>
                    <p>
                        We also process settings, subscription records, notification preferences,
                        device push tokens, and error and performance information. We use this data
                        to provide and personalize Evolella, manage purchases, send service
                        messages, respond to requests and keep the service secure.
                    </p>
                    <p>
                        We process data to provide the service you request, to keep it secure and
                        reliable, and — where required — with your consent, such as for optional
                        analytics.
                    </p>
                </Section>
                <Section title="AI and service providers">
                    <p>
                        Google Gemini is our main AI service; we also use OpenRouter and OpenAI. AI
                        providers receive relevant messages, profile information and coaching
                        context to generate responses and saved memories. Voice input sends audio
                        for transcription; server-side speech synthesis is not currently enabled, so
                        replies are returned as text. Avoid sharing sensitive information you do not
                        want these services to process.
                    </p>
                    <p>
                        For launch, we plan to use Gemini with billing enabled. Under Google&apos;s
                        paid API terms, prompts and responses are not used to improve its products;
                        retention for safety and legal purposes may still apply.
                    </p>
                    <p>
                        We use UpCloud for primary hosting in the United States, Google for sign-in,
                        Resend for email, and Sentry for error and performance diagnostics. When
                        enabled, Paddle handles web payments, RevenueCat and app stores handle
                        mobile subscriptions, and Expo delivers mobile push notifications. Payment
                        details are collected through the payment provider or app store.
                    </p>
                    <p>
                        Your data is processed mainly in the United States. Our providers may
                        process data in other countries under their own terms and safeguards.
                    </p>
                </Section>
                <Section title="Cookies and analytics">
                    <p>
                        Necessary cookies and storage support sign-in and preferences. Optional
                        product analytics are not currently enabled and require your opt-in before
                        use. You can change or withdraw consent through Data &amp; privacy settings
                        or below. Sentry diagnostics and service logs are separate and are not
                        disabled by this choice.
                    </p>
                    <p>
                        <CookieSettingsButton />
                    </p>
                </Section>
                <Section title="How long we keep data">
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>90 days:</strong> AI conversation messages, notifications, AI
                            feedback and duplicate-processing records. Older records are permanently
                            removed during daily cleanup.
                        </li>
                        <li>
                            <strong>12 months (365 days):</strong> activity history.
                        </li>
                        <li>
                            <strong>30 days:</strong> push-delivery and search-synchronization
                            records.
                        </li>
                        <li>
                            <strong>15 minutes:</strong> generated export download links.
                        </li>
                        <li>
                            <strong>Until account deletion:</strong> habits, goals, check-ins,
                            plans, reviews, saved items and coaching profiles, unless removed
                            earlier where supported.
                        </li>
                    </ul>
                    <p>
                        Saved AI memories, reports and uploaded files do not automatically expire.
                        What happens to them when you delete your account is explained below.
                    </p>
                    <p>
                        Deleted data may remain in local backups, which use a seven-day retention
                        period. Off-site backups are not currently configured. Provider-held records
                        follow each provider&apos;s retention — for example, up to 30 days for
                        Sentry error data and Resend email records on our current plans.
                    </p>
                </Section>
                <Section title="Your data and choices">
                    <p>
                        You can export data or permanently delete your account in Data &amp; privacy
                        settings. The export includes profile and settings information, habits,
                        goals, check-ins, reviews, saved items, activity, coaching profile and
                        notifications. It is limited: conversations, saved AI memories, plans,
                        reports and uploaded files are excluded, and some history or unavailable
                        sections may be missing.
                    </p>
                    <p>
                        Account deletion permanently removes your account and starts removal of the
                        associated habits, goals, check-ins, plans, reviews, saved items,
                        notifications, conversations, saved AI memories and reports. Completion
                        across services can take time. Uploaded files and generated export files are
                        not yet covered by automated deletion and may remain until removed manually.
                        Deleting an account does not cancel external subscriptions.
                    </p>
                    <p>
                        Depending on applicable law — including the privacy laws of your state — you
                        may request access, correction, erasure, restriction or portability of your
                        data, object to processing, or withdraw consent. Contact{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>
                        .
                    </p>
                </Section>
                <Section title="Security and updates">
                    <p>
                        We use encrypted connections, password hashing and access controls. No
                        service can guarantee absolute security. The date above shows the latest
                        revision. We will notify you in the app of material changes to this policy.
                    </p>
                    <p>
                        See our{' '}
                        <Link className="underline" href="/terms">
                            Terms of Service
                        </Link>
                        .
                    </p>
                </Section>
            </div>
        </main>
    );
}
