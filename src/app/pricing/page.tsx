import { headers } from 'next/headers';
import Link from 'next/link';
import { Pricing } from '@/components/billing/pricing';

// Geo headers set by common edge/CDN layers, in priority order. Cloudflare
// sets CF-IPCountry on proxied requests (our production setup); the others
// cover Vercel and CloudFront if the app is ever deployed there.
const GEO_HEADERS = [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'cloudfront-viewer-country',
];

// Cloudflare sends XX (unknown) / T1 (Tor) when it can't map the IP — treat
// those the same as a missing header.
const IGNORED_CODES = new Set(['XX', 'T1']);

export default async function PricingPage() {
    const h = await headers();
    let country: string | undefined;
    for (const name of GEO_HEADERS) {
        const value = h.get(name)?.toUpperCase();
        if (value && !IGNORED_CODES.has(value)) {
            country = value;
            break;
        }
    }
    // When no geo header is present we pass nothing — Paddle auto-detects the
    // buyer's country from their IP at PricePreview/checkout time.
    return (
        <>
            <Pricing country={country} />
            {/* Legal links on the checkout page itself — required by Paddle's
                website approval ("must link through to terms, privacy notice
                and refund policy"). */}
            <footer className="mx-auto w-full max-w-3xl px-4 pb-10">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
                    <Link className="underline-offset-2 hover:underline" href="/terms">
                        Terms of Service
                    </Link>
                    <Link className="underline-offset-2 hover:underline" href="/privacy">
                        Privacy Policy
                    </Link>
                    <Link className="underline-offset-2 hover:underline" href="/refunds">
                        Refund &amp; Cancellation Policy
                    </Link>
                    <a
                        className="underline-offset-2 hover:underline"
                        href="mailto:support@evolella.com"
                    >
                        support@evolella.com
                    </a>
                </div>
            </footer>
        </>
    );
}
