'use client';

import { type Paddle, type PricePreviewParams, type PricePreviewResponse } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { PricingTiers } from '@/constants/pricing-tiers';

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams['items'] {
    const ids = new Set(
        PricingTiers.flatMap(tier =>
            tier.priceId ? [tier.priceId.month, tier.priceId.year] : [],
        ),
    );
    return [...ids].map(priceId => ({ priceId, quantity: 1 }));
}

function getPriceAmounts(prices: PricePreviewResponse): PaddlePrices {
    return prices.data.details.lineItems.reduce<PaddlePrices>((acc, item) => {
        // formattedTotals.total is already localized ("$9.99", "¥1,200") — use it
        // verbatim, never reformat or do math on it.
        acc[item.price.id] = item.formattedTotals.total;
        return acc;
    }, {});
}

/**
 * Localized totals for every priceId in the catalog, keyed by priceId.
 * When `country` is undefined the address field is omitted entirely and Paddle
 * detects location from the visitor's IP — never pass a sentinel country code.
 * Previous prices stay visible while a new country refetches.
 */
export function usePaddlePrices(
    paddle: Paddle | undefined,
    country?: string,
): { prices: PaddlePrices } {
    const [prices, setPrices] = useState<PaddlePrices>({});

    useEffect(() => {
        if (!paddle) return;

        const params: PricePreviewParams = {
            items: getLineItems(),
            ...(country ? { address: { countryCode: country } } : {}),
        };

        let cancelled = false;
        paddle.PricePreview(params)
            .then(response => {
                if (!cancelled) {
                    setPrices(prev => ({ ...prev, ...getPriceAmounts(response) }));
                }
            })
            .catch(err => {
                // Static display prices stay on screen; log for diagnosis.
                console.warn('[paddle] PricePreview failed', err);
            });
        return () => {
            cancelled = true;
        };
    }, [country, paddle]);

    return { prices };
}
