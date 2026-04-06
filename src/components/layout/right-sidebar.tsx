import { PremiumCard } from '@/components/shared/premium-card';
import { SuggestedUsers } from '@/components/shared/suggested-users';
import { TrendingTopics } from '@/components/shared/trending-topics';

export function RightSidebar() {
    return (
        <div className="flex h-full w-full flex-col border-l border-border/70 bg-background/95 p-4 overflow-y-auto backdrop-blur">
            <div className="space-y-4">
                <PremiumCard />
            </div>
            <div className="mt-6 space-y-6">
                <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Trending</h3>
                    <TrendingTopics />
                </section>
                <section>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Who to follow</h3>
                    <SuggestedUsers />
                </section>
            </div>
        </div>
    );
}
