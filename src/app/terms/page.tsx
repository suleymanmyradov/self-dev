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
                <p>
                    Evolella is operated by Suleyman Myradow. For support or privacy requests,
                    contact{' '}
                    <a className="underline" href="mailto:support@evolella.com">
                        support@evolella.com
                    </a>
                    .
                </p>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        1. Using Evolella
                    </h2>
                    <p>
                        By creating an account or using Evolella, you agree to these Terms. Evolella
                        provides habit and goal tracking and an AI accountability coach. AI guidance
                        may be inaccurate and is not medical, psychological or financial advice.
                        Consult a qualified professional when needed.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        2. Your account and conduct
                    </h2>
                    <p>
                        You must be at least 18 years old to use Evolella. The service is intended
                        for users in the United States. Provide accurate information and keep your
                        credentials secure. Do not use the service unlawfully, access other
                        users&apos; data, scrape or resell the service, generate harmful content, or
                        disrupt its operation. We may suspend accounts or remove content that
                        violates these Terms.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        3. Your content
                    </h2>
                    <p>
                        You retain ownership of your content and allow us to store and process it to
                        provide the service, including sharing relevant context with AI providers.
                        Our{' '}
                        <Link className="underline" href="/privacy">
                            Privacy Policy
                        </Link>{' '}
                        explains how we handle personal data.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        4. Subscriptions
                    </h2>
                    <p>
                        When available, web payments use Paddle and mobile purchases use the
                        relevant app store, with RevenueCat managing subscription access. Prices,
                        billing periods and any trial are shown at checkout.
                    </p>
                    <p>
                        Subscriptions renew automatically until cancelled. For web purchases, cancel
                        through Paddle&apos;s hosted customer portal, available from the Manage
                        subscription link in your purchase email. For mobile purchases, use the app
                        store where you subscribed. Cancellation scheduled for the end of a paid
                        period normally preserves access until then. Deleting your account does not
                        cancel a subscription; cancel it separately first.
                    </p>
                    <p>
                        Refund requests for web purchases are handled through Paddle under its{' '}
                        <a className="underline" href="https://www.paddle.com/legal/refund-policy">
                            refund policy
                        </a>{' '}
                        and applicable consumer law — see our{' '}
                        <Link className="underline" href="/refunds">
                            Refund &amp; Cancellation Policy
                        </Link>
                        . Mobile purchases follow the relevant app store&apos;s refund process.
                        Contact{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>{' '}
                        for help.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        5. Leaving Evolella
                    </h2>
                    <p>
                        You can permanently delete your account in Data &amp; privacy settings. Our{' '}
                        <Link className="underline" href="/privacy">
                            Privacy Policy
                        </Link>{' '}
                        explains deletion, retention and export limitations.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        6. Availability and liability
                    </h2>
                    <p>
                        The service is provided &ldquo;as is&rdquo;, without guaranteed
                        uninterrupted availability. We may change or discontinue features, with
                        advance notice of material adverse changes where practical. We will notify
                        you in the app of material changes to these Terms.
                    </p>
                    <p>
                        To the maximum extent permitted by law, we are not liable for indirect or
                        consequential damages, and our total liability is limited to the amount you
                        paid us in the 12 months before the claim. Nothing in these Terms excludes
                        rights or liability that cannot legally be excluded.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        7. Governing law and contact
                    </h2>
                    <p>
                        These Terms are governed by the laws of the State of Delaware, United
                        States, and disputes are handled in its courts, except where your local
                        consumer law gives you the right to complain or sue elsewhere. Mandatory
                        consumer rights remain unaffected. Questions:{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </section>
    );
}
