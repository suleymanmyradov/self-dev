export interface Tier {
    name: 'Free' | 'Pro';
    description: string;
    features: string[];
    featured: boolean;
    // Paddle catalog price IDs, resolved per environment (see below). Absent
    // for the free tier — it never checks out.
    priceId?: { month: string; year: string };
    // Static USD display fallback — shown only when the Paddle localized
    // price preview can't load (e.g. domain pending approval). Checkout
    // always bills the catalog price; this is display-only.
    displayPrice?: { month: string; year: string };
}

// Sandbox and production catalogs have different pri_ IDs. They come from
// NEXT_PUBLIC_* env vars so local dev + e2e keep working against sandbox while
// the prod build points at the live catalog. Fail loudly when unset — a
// missing ID mid-checkout would surface as a generic Paddle error otherwise.
function proPriceId(): { month: string; year: string } {
    const month = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY;
    const year = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY;
    if (!month || !year) {
        throw new Error(
            'Paddle price IDs are not configured: set NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY and NEXT_PUBLIC_PADDLE_PRICE_PRO_YEARLY',
        );
    }
    return { month, year };
}

export const PricingTiers: Tier[] = [
    {
        name: 'Free',
        description: 'Start building better habits today.',
        features: [
            'Up to 5 active habits',
            'Up to 3 active goals',
            'Weekly review',
            'Community articles',
        ],
        featured: false,
    },
    {
        name: 'Pro',
        description: 'Your AI accountability coach, unlimited.',
        features: [
            'Unlimited habits and goals',
            'Personalized AI coaching memory',
            'Unlimited plan adjustments',
            'Full weekly history',
            'Priority support',
        ],
        featured: true,
        // Lazy getter — modules importing PricingTiers without Paddle env
        // (tests, SSR shells) only throw when a paid tier is actually read.
        get priceId() {
            return proPriceId();
        },
        displayPrice: { month: '$9.99', year: '$99.90' },
    },
];
