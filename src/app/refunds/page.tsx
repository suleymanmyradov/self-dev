import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy — Evolella',
    description: 'How to cancel your Evolella subscription and how refunds are handled.',
};

export default function RefundsPage() {
    return (
        <section className="mx-auto w-full max-w-2xl px-4 py-12">
            <h1 className="font-display-face text-3xl font-semibold">
                Refund &amp; Cancellation Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: September 24, 2026</p>

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
                        Cancelling your subscription
                    </h2>
                    <p>
                        You can cancel your Evolella Pro subscription at any time. For web
                        purchases, cancel through Paddle&apos;s hosted customer portal — open
                        &ldquo;Manage billing&rdquo; under Plan &amp; billing in your account
                        settings, or use the manage-subscription link in your purchase email. For
                        mobile purchases, cancel in the app store where you subscribed.
                    </p>
                    <p>
                        Cancellation takes effect at the end of the current paid period — you keep
                        Pro access until then, and no further renewals are charged. Deleting your
                        account does not cancel a subscription; cancel it separately first.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        Refunds for web purchases
                    </h2>
                    <p>
                        Web purchases are processed by Paddle, our merchant of record. Refund
                        requests are handled under Paddle&apos;s{' '}
                        <a
                            className="underline"
                            href="https://www.paddle.com/legal/refund-policy"
                        >
                            refund policy
                        </a>{' '}
                        and applicable consumer law. If you believe a charge was made in error,
                        contact us within 14 days of the transaction at{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>{' '}
                        with your purchase email and we will review the request case by case.
                        Approved refunds are issued to the original payment method.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        Refunds for mobile purchases
                    </h2>
                    <p>
                        Subscriptions bought through the Apple App Store or Google Play are billed
                        and refunded by the respective store under its own policies. Request those
                        refunds through the store&apos;s refund process.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="font-display-face text-xl font-semibold text-foreground">
                        Questions
                    </h2>
                    <p>
                        For billing help, contact{' '}
                        <a className="underline" href="mailto:support@evolella.com">
                            support@evolella.com
                        </a>
                        . This policy supplements our{' '}
                        <Link className="underline" href="/terms">
                            Terms of Service
                        </Link>
                        ; statutory consumer rights are unaffected.
                    </p>
                </section>
            </div>
        </section>
    );
}
