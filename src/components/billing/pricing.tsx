'use client';

import { type Environments, initializePaddle, type Paddle } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { usePaddlePrices } from '@/hooks/use-paddle-prices';
import { PricingTiers, type Tier } from '@/constants/pricing-tiers';
import { useAuthStore } from '@/store/auth';
import { useBillingOverview } from '@/hooks/use-billing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Frequency = 'month' | 'year';

function paddleConfig(): { token: string; environment: Environments } {
    // Fail loudly when unset — silently defaulting could point the app at the
    // wrong Paddle account.
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV;
    if (!token || !environment) {
        throw new Error(
            'Paddle is not configured: set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_ENV',
        );
    }
    if (environment !== 'sandbox' && environment !== 'production') {
        throw new Error(
            `NEXT_PUBLIC_PADDLE_ENV must be "sandbox" or "production", got "${environment}"`,
        );
    }
    return { token, environment: environment as Environments };
}

interface Props {
    // ISO country code detected server-side from request headers. Undefined
    // means "let Paddle infer from IP" — it is never passed to Paddle.
    country?: string;
}

export function Pricing({ country }: Props) {
    const router = useRouter();
    const [frequency, setFrequency] = useState<Frequency>('month');
    const [paddle, setPaddle] = useState<Paddle | undefined>();
    const user = useAuthStore(s => s.user);
    const hasHydrated = useAuthStore(s => s.hasHydrated);
    const { data: billing, isPending: billingPending } = useBillingOverview();
    const currentPlan = billing?.subscription?.planCode;
    const paddleCustomerId = billing?.subscription?.paddleCustomerId;

    const { prices } = usePaddlePrices(paddle, country);

    useEffect(() => {
        if (!hasHydrated || paddle?.Initialized) return;
        // Signed-in users: wait for the billing overview so Paddle Retain gets
        // the Paddle customer ID (pwCustomer) when one exists. Anonymous users
        // init immediately — the overview query is disabled without a token.
        if (user && billingPending) return;
        initializePaddle({
            ...paddleConfig(),
            ...(paddleCustomerId ? { pwCustomer: { id: paddleCustomerId } } : {}),
        }).then(p => p && setPaddle(p));
    }, [paddle?.Initialized, hasHydrated, user, billingPending, paddleCustomerId]);

    function handleSubscribe(tier: Tier) {
        if (!tier.priceId) return;
        // Paid checkout requires an account — an anonymous payment can't be
        // mapped to a user by the webhook, so gate it behind login. Checked
        // before `paddle` so anonymous clicks work before Paddle.js loads.
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }
        if (!paddle) return;
        paddle.Checkout.open({
            items: [{ priceId: tier.priceId[frequency], quantity: 1 }],
            ...(user.email && { customer: { email: user.email } }),
            // custom_data.user_id lets the Go webhook map the payment to the account.
            customData: { user_id: user.id },
            settings: {
                displayMode: 'overlay',
                variant: 'one-page',
                successUrl: `${window.location.origin}/welcome`,
            },
        });
    }

    function tierCta(tier: Tier): { label: string; disabled: boolean } {
        const isCurrent =
            (tier.name === 'Free' && currentPlan === 'free') ||
            (tier.name === 'Pro' && currentPlan === 'pro');
        if (isCurrent) return { label: 'Current plan', disabled: true };
        if (!tier.priceId) {
            // Free tier never checks out — anonymous users register instead.
            return { label: user ? 'Included' : 'Create free account', disabled: !!user };
        }
        // Signed-in clicks open Paddle checkout (needs paddle ready);
        // anonymous clicks just redirect to login — no Paddle needed.
        return { label: 'Subscribe', disabled: !!user && !paddle };
    }

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Choose your plan</h1>
                <p className="mt-2 text-muted-foreground">
                    Start free, upgrade when you need more.
                </p>
            </div>

            <div className="mb-10 flex justify-center">
                <div className="inline-flex rounded-lg border border-border p-1">
                    {(['month', 'year'] as const).map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFrequency(f)}
                            className={cn(
                                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                                frequency === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {f === 'month' ? 'Monthly' : 'Yearly'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {PricingTiers.map(tier => {
                    const priceId = tier.priceId?.[frequency];
                    // Show the static USD price immediately — the localized
                    // Paddle preview swaps in when it resolves (or never,
                    // if the preview call fails).
                    const formatted = priceId
                        ? (prices[priceId] ?? tier.displayPrice?.[frequency] ?? '…')
                        : '$0';
                    const cta = tierCta(tier);
                    return (
                        <div
                            key={tier.name}
                            className={cn(
                                'flex flex-col rounded-xl border p-6',
                                tier.featured ? 'border-primary shadow-md' : 'border-border',
                            )}
                        >
                            <h2 className="text-lg font-semibold">{tier.name}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>

                            <p className="mt-4">
                                <span className="text-3xl font-semibold">{formatted ?? '…'}</span>
                                <span className="text-sm text-muted-foreground">
                                    /{frequency === 'month' ? 'mo' : 'yr'}
                                </span>
                            </p>

                            <ul className="mt-5 flex-1 space-y-2">
                                {tier.features.map(feature => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="mt-6 w-full"
                                variant={tier.featured ? 'default' : 'outline'}
                                disabled={cta.disabled}
                                onClick={() =>
                                    !tier.priceId && !user
                                        ? router.push('/register')
                                        : handleSubscribe(tier)
                                }
                            >
                                {cta.label}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
