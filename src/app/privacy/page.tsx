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
                <p className="rounded-lg border border-border p-4 text-sm">
                    <strong>Draft — owner confirmation required.</strong> Bracketed items identify
                    unresolved legal details or operational checks. This policy is not ready for
                    publication until those items are resolved.
                </p>
                <Section title="Who we are">
                    <p>
                        Evolella is a self-development platform with an AI accountability coach.
                        This policy explains the personal data processed to operate it.
                    </p>
                    <p>
                        Operator and data controller: [OWNER TO CONFIRM: full legal name, registered
                        address, and country of establishment]. Privacy contact: [OWNER TO CONFIRM:
                        monitored privacy contact email].
                    </p>
                </Section>
                <Section title="Data we collect">
                    <p>
                        <strong>Account data.</strong> We store your email address, username, name
                        and profile information you provide. Password-based accounts have a hashed
                        password; Google-only sign-in does not require a local password. Google
                        sign-in provides your Google account identifier, name, email address,
                        verification status and profile picture.
                    </p>
                    <p>
                        <strong>Content and preferences.</strong> We store habits, goals, check-ins,
                        plans, weekly reviews, saved items, settings, coaching profiles, AI
                        conversations and long-term memory facts. Reports you submit can include
                        contact details, descriptions, comments and attachments.
                    </p>
                    <p>
                        <strong>Voice.</strong> When voice features are available and you use them,
                        audio is sent for transcription. Text submitted to the coach is stored as
                        conversation content. Spoken replies also involve sending response text for
                        speech synthesis.
                    </p>
                    <p>
                        <strong>Files and exports.</strong> Uploaded images and attachments, and
                        generated JSON data exports, are stored in MinIO object storage.
                    </p>
                    <p>
                        <strong>Billing and notifications.</strong> When these features are enabled,
                        we process subscription status, plan and billing periods, payment-provider
                        customer and subscription identifiers, notification preferences, device push
                        tokens and delivery records. Payment details are entered in the payment
                        provider or app-store checkout, not an Evolella card-entry form.
                    </p>
                    <p>
                        <strong>Operational data.</strong> We process request, error and performance
                        information to operate and troubleshoot the service, including diagnostic
                        events and sampled performance traces sent to Sentry. This is separate from
                        optional product analytics.
                    </p>
                </Section>
                <Section title="How we use your data">
                    <p>
                        We use data to manage accounts, provide habit and goal tracking, personalize
                        plans and coaching, deliver notifications and email, manage enabled
                        subscriptions, handle reports, and maintain service security and
                        reliability. Relevant profile information, goals, habits, check-ins,
                        reviews, memories and conversation history can be used as coaching context.
                    </p>
                    <p>
                        We do not sell your personal data. [OWNER TO CONFIRM: this business-policy
                        commitment and the legal basis for each processing purpose, including any
                        sensitive information users share with the coach].
                    </p>
                </Section>
                <Section title="AI and voice processing">
                    <p>
                        Relevant conversation content and coaching context are sent to the
                        configured OpenAI-compatible LLM provider to generate responses and coaching
                        memories. Fallback providers may process requests if the primary provider
                        fails. The integration is not limited to a single model or to Google Gemini.
                    </p>
                    <p>
                        Voice audio is sent to the configured speech-to-text provider, and response
                        text may be sent to the text-to-speech provider. These providers can differ
                        from the coaching provider. Avoid sharing information you do not want an
                        external AI or speech service to process.
                    </p>
                    <p>
                        [OWNER TO CONFIRM: names of the active AI, fallback and speech providers,
                        processing countries, and their contractual retention and model-training
                        terms]. We cannot promise that provider-side retention or training is
                        disabled without confirming those terms.
                    </p>
                </Section>
                <Section title="Service providers and hosting">
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>Hosting:</strong> the application and backend run on a single
                            virtual machine with PostgreSQL and MinIO. [OWNER TO CONFIRM: hosting
                            provider and hosting country].
                        </li>
                        <li>
                            <strong>Cloudflare R2:</strong> off-site storage for database and
                            object-storage backups.
                        </li>
                        <li>
                            <strong>Google:</strong> OAuth sign-in when you choose it.
                        </li>
                        <li>
                            <strong>AI and speech providers:</strong> the content described in the
                            AI and voice section.
                        </li>
                        <li>
                            <strong>Resend:</strong> recipient email addresses and message content
                            for transactional emails, including verification and password reset.
                        </li>
                        <li>
                            <strong>Sentry:</strong> error diagnostics and sampled performance
                            traces. Default personal-information collection is disabled in the SDK
                            configuration, and session replay is not enabled; diagnostic payloads
                            may still contain personal data.
                        </li>
                        <li>
                            <strong>Paddle:</strong> web checkout and subscription processing when
                            web payments are enabled.
                        </li>
                        <li>
                            <strong>RevenueCat and the relevant app store:</strong> mobile purchase
                            and subscription entitlement processing when mobile subscriptions are
                            enabled.
                        </li>
                        <li>
                            <strong>Expo:</strong> device push tokens and notification content for
                            mobile push delivery when enabled.
                        </li>
                    </ul>
                    <p>PostHog product analytics is not currently enabled.</p>
                    <p>
                        [OWNER TO CONFIRM: provider processing locations, international transfers
                        and applicable safeguards]. This policy does not assert a US-only or EU-only
                        hosting or processing region.
                    </p>
                </Section>
                <Section title="Cookies and optional analytics">
                    <p>
                        Necessary cookies and browser storage support sign-in and preferences.
                        Optional analytics require an explicit opt-in; no choice means no analytics
                        consent. Your choice is stored in localStorage as{' '}
                        <code>evolella.consent</code> and in the versioned{' '}
                        <code>evolella_consent</code> cookie. The cookie has a one-year lifetime;
                        the localStorage record has no automatic time-based expiry. A
                        consent-version change requires a new choice.
                    </p>
                    <p>
                        You can change or withdraw optional analytics consent using the consent
                        banner, Data &amp; privacy settings, or the button below. Withdrawal stops
                        future optional analytics collection on this device; it does not delete
                        previously collected data. PostHog is not enabled and production Web Vitals
                        reporting currently sends no metrics. Any future optional analytics or Web
                        Vitals reporting requires consent.
                    </p>
                    <p>
                        Sentry diagnostics and operational service logs are separate from optional
                        product analytics and are not disabled by this consent control.
                    </p>
                    <p>
                        Change your choice here: <CookieSettingsButton />
                    </p>
                </Section>
                <Section title="Retention">
                    <p>
                        Automated database cleanup runs nightly at 05:45 UTC. Age limits are applied
                        by that scheduled job, not at the exact instant a record reaches its limit.
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>AI transcripts:</strong> conversation messages older than 90
                            days are hard-deleted. Conversation records inactive for more than 90
                            days are also deleted. This limit applies to transcripts, not separately
                            stored long-term memory facts.
                        </li>
                        <li>
                            <strong>90 days:</strong> notifications, AI feedback, duplicate-event
                            processing records (idempotency), stale reminder deduplication state and
                            sent reminders.
                        </li>
                        <li>
                            <strong>12 months (365 days):</strong> activity history.
                        </li>
                        <li>
                            <strong>30 days:</strong> push-delivery tickets and search-index
                            synchronization queue records.
                        </li>
                        <li>
                            <strong>Account-lifetime content:</strong> habits, goals, check-ins,
                            plans, reviews, saved items and coaching profiles have no scheduled
                            age-based expiry and are kept until account deletion or earlier removal
                            where supported.
                        </li>
                        <li>
                            <strong>Long-term memory facts and reports:</strong> these also have no
                            scheduled age-based expiry. [OWNER ACTION REQUIRED: verify and complete
                            their account-deletion cleanup before promising account-lifetime
                            retention].
                        </li>
                        <li>
                            <strong>Uploads and generated export files:</strong> [OWNER TO CONFIRM:
                            retention and account-deletion cleanup]. Expiry of an export download
                            link does not delete the stored file.
                        </li>
                    </ul>
                    <p>
                        <strong>Backups.</strong> PostgreSQL and MinIO are backed up nightly. Local
                        backup pruning uses a seven-day retention setting. Off-site copies are
                        stored in Cloudflare R2; the sync job does not itself delete older remote
                        copies. [OWNER TO CONFIRM: R2 lifecycle/expiry and how erasure is preserved
                        after a restore]. Database deletion does not immediately remove data from
                        existing backups or a provider&apos;s separate records.
                    </p>
                    <p>
                        [OWNER TO CONFIRM: retention periods for provider-held diagnostics, email
                        and billing records, and any other operational records not covered above].
                    </p>
                </Section>
                <Section title="Export and account deletion">
                    <p>
                        <strong>Export.</strong> From your profile&apos;s Data &amp; privacy
                        settings you can request a JSON export. It gathers your profile, habits,
                        goals, check-ins, weekly reviews, saved items, activity history, settings,
                        coaching profile and notifications, together with your user ID and export
                        timestamp. The download link expires after 15 minutes.
                    </p>
                    <p>
                        This is not a complete copy of all stored data: conversations, long-term
                        memory facts, plans, reports and uploaded files are not included.
                        Collections are fetched only one page at a time, with a requested limit of
                        1,000 records; individual services may apply lower limits. Weekly reviews
                        are capped at 50 and may be further limited by your plan. If a service
                        fails, its section may be omitted from an otherwise successful export.
                    </p>
                    <p>
                        <strong>Account deletion.</strong> Deleting your account hard-deletes the
                        user record and cascades to profile, preference and linked OAuth-account
                        records. A deletion event triggers asynchronous cleanup of habits, goals,
                        check-ins, plans, reviews, saved items, notifications and AI conversations
                        in the other services. This is permanent deletion, not a recoverable
                        deactivation or a grace period. Cross-service cleanup is not instantaneous
                        and depends on successful event delivery and processing.
                    </p>
                    <p>
                        The unresolved cleanup items and backup limits in the retention section also
                        apply to account deletion. Deleting an Evolella account does not itself
                        cancel a subscription with an external payment provider or app store; cancel
                        it separately before deleting the account.
                    </p>
                </Section>
                <Section title="Privacy rights and legal details">
                    <p>
                        Depending on the law that applies to you, you may have rights of access,
                        correction, erasure, restriction, objection and portability, to withdraw
                        consent where processing relies on it, and to complain to a data-protection
                        authority. The limited self-service export is not a statement that it
                        fulfills every access or portability request.
                    </p>
                    <p>
                        Requests: [OWNER TO CONFIRM: monitored privacy contact email and
                        request-handling process]. [OWNER TO CONFIRM: applicable jurisdiction,
                        GDPR/UK GDPR applicability, legal bases, relevant supervisory authority and
                        any required representative].
                    </p>
                </Section>
                <Section title="Security">
                    <p>
                        We use HTTPS/TLS through Caddy for public connections, bcrypt hashing for
                        account passwords, authenticated access and access controls. Nightly backups
                        support recovery. These measures do not guarantee absolute security or
                        uninterrupted availability.
                    </p>
                </Section>
                <Section title="Changes and contact">
                    <p>
                        The date above identifies this revision. [OWNER TO CONFIRM: process and
                        timing for notifying users of material changes before they take effect].
                    </p>
                    <p>
                        Questions or requests: [OWNER TO CONFIRM: monitored support/privacy contact
                        email]. See also our{' '}
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
