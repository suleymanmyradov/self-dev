import { headers } from 'next/headers';
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
    return <Pricing country={country} />;
}
