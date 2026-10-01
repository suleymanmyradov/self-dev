import { useQuery } from '@tanstack/react-query';
import { getCheckInHistory } from '@/api';
import type { CheckIn } from '@/api';

const PAGE_SIZE = 100;
// Hard cap so a user with years of history can't trigger unbounded fetches.
// 5 × 100 = 500 check-ins — far beyond what any single week can contain.
const MAX_PAGES = 5;

/** Parses a YYYY-MM-DD API date as a local day (not UTC midnight). */
function parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Fetches the check-in records needed for a week's daily chart. The history
 * endpoint returns newest-first pages with no date filter, so this pages
 * forward only until every remaining record predates `weekStart`.
 */
export function useCheckInHistory(weekStart: string | undefined) {
    return useQuery({
        queryKey: ['check-in-history', weekStart ?? ''],
        enabled: !!weekStart,
        queryFn: async () => {
            const start = parseLocalDate(weekStart!);
            const all: CheckIn[] = [];
            for (let page = 1; page <= MAX_PAGES; page++) {
                const res = await getCheckInHistory({ page, limit: PAGE_SIZE });
                const items = res.data ?? [];
                all.push(...items);
                const oldest = items[items.length - 1];
                if (items.length < PAGE_SIZE || (oldest && new Date(oldest.createdAt) < start)) {
                    break;
                }
            }
            return all;
        },
    });
}

/**
 * Buckets check-in records into Mon–Sun counts for the week starting at
 * `weekStart` (local YYYY-MM-DD). Days are compared in the user's local
 * timezone, matching how the backend assigns each check-in to a local date.
 */
export function dailyCheckInCounts(checkIns: CheckIn[] | undefined, weekStart: string): number[] {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    if (!checkIns) return counts;
    const start = parseLocalDate(weekStart).getTime();
    const end = start + 7 * 86400000;
    for (const ci of checkIns) {
        const t = new Date(ci.createdAt);
        const day = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
        const idx = Math.floor((day - start) / 86400000);
        if (day >= start && day < end && idx >= 0 && idx < 7) {
            counts[idx]++;
        }
    }
    return counts;
}
