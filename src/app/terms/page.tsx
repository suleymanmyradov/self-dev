import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service — Evolella',
    description: 'The terms that apply when you use Evolella.',
};

export default function TermsPage() {
    return (
        <section className="mx-auto w-full max-w-2xl px-4 py-12">
            <h1 className="font-display-face text-3xl font-semibold">Terms of Service</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: September 23, 2026</p>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
                <p className="rounded-lg border border-border p-4 text-foreground">
                    <strong>Draft — owner confirmation required.</strong> Bracketed items identify
                    unresolved legal or commercial terms. These Terms are not ready for publication
                    until those items are resolved.
                </p>
                <p>
                    Service operator: [OWNER TO CONFIRM: full legal name, registered address, and
                    country of establishment].
                </p>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        1. Acceptance
                    </h2>
                    <p>
                        By creating an account or using Evolella (the &ldquo;Service&rdquo;) you
                        agree to these Terms. If you do not agree, do not use the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        2. The Service
                    </h2>
                    <p>
                        Evolella is a self-development platform providing habit and goal tracking,
                        check-ins, and an AI-based accountability coach. The AI coach offers general
                        guidance and motivation — it is{' '}
                        <strong>not medical, psychological, or financial advice</strong>. Always
                        consult a qualified professional for health or mental-health decisions.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        3. Your account
                    </h2>
                    <p>
                        You are responsible for keeping your credentials secure and for activity
                        under your account. You must provide accurate information. [OWNER TO
                        CONFIRM: minimum age, applicable local age requirements and any
                        parental-consent policy]. Registration does not currently verify your age.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        4. Acceptable use
                    </h2>
                    <p>
                        Do not misuse the Service: no unlawful content, no attempting to access
                        other users&rsquo; data, no scraping or reselling the Service, no abusing
                        the AI coach to generate harmful content, and no disrupting the
                        infrastructure.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        5. Subscriptions
                    </h2>
                    <p>
                        When web payments are enabled, web subscriptions are processed through
                        Paddle. When mobile subscriptions are enabled, purchases are processed
                        through the relevant app store and subscription entitlements are managed
                        through RevenueCat. Available plans, prices, billing intervals and any trial
                        are shown at checkout.
                    </p>
                    <p>
                        Recurring subscriptions renew unless cancelled through the provider or app
                        store that manages the purchase. Use that provider&apos;s
                        subscription-management instructions; an in-app cancellation portal is not
                        available for every provider. Where cancellation is scheduled for the end of
                        a paid period, access continues until that period ends, subject to the
                        provider&apos;s subscription status.
                    </p>
                    <p>
                        Deleting your Evolella account does not itself cancel an external
                        subscription. Cancel it separately before deleting your account. Refund
                        requests follow the applicable payment-provider or app-store process and any
                        mandatory consumer rights. [OWNER TO CONFIRM: refund and withdrawal policy,
                        cancellation instructions, and billing-support contact].
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        6. Your content
                    </h2>
                    <p>
                        You keep ownership of the content you create. You grant us the limited right
                        to process and store it to operate the Service (including sending relevant
                        context to our AI provider to generate your coaching). We may remove content
                        that violates these Terms.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        7. Availability &amp; changes
                    </h2>
                    <p>
                        We aim for high availability but the Service is provided &ldquo;as is&rdquo;
                        without warranties. We may modify or discontinue features; material adverse
                        changes will be communicated in advance where practical.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        8. Limitation of liability
                    </h2>
                    <p>
                        To the maximum extent permitted by law, we are not liable for indirect or
                        consequential damages, and our total liability is limited to the amount you
                        paid us in the 12 months before the claim.
                    </p>
                    <p>
                        [OWNER TO CONFIRM: enforceability of the warranty and liability terms under
                        the chosen law, including mandatory consumer-law exceptions, and the process
                        for advance notice of material adverse changes].
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        9. Termination
                    </h2>
                    <p>
                        You can request permanent account deletion from Data &amp; privacy settings.
                        The user record is hard-deleted and cleanup in other services is
                        asynchronous, not a recovery grace period. See our{' '}
                        <Link className="underline" href="/privacy">
                            Privacy Policy
                        </Link>{' '}
                        for retention periods, export limits, backup retention and unresolved
                        cleanup items. Account deletion does not cancel external subscriptions.
                    </p>
                    <p>We may suspend accounts that violate these Terms.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        10. Governing law and disputes
                    </h2>
                    <p>
                        [OWNER TO CONFIRM: governing law, jurisdiction and courts or other
                        dispute-resolution process]. Any choice must preserve applicable mandatory
                        consumer rights.
                    </p>
                </section>
                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        11. Contact
                    </h2>
                    <p>
                        Questions: [OWNER TO CONFIRM: monitored support contact email]. Privacy
                        requests: [OWNER TO CONFIRM: monitored privacy contact email].
                    </p>
                </section>
            </div>
        </section>
    );
}
