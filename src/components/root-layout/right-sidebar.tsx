import { PremiumCard } from '@/components/shared/premium-card';
import { SuggestedUsers } from '@/components/shared/suggested-users';
import { TrendingTopics } from '@/components/shared/trending-topics';

export function RightSidebar() {
    return (
        <div className="flex h-full w-full flex-col border-l bg-background p-4 overflow-y-auto">
            <PremiumCard />
            <div className="space-y-6">
                <section>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Trending</h3>
                    <TrendingTopics />
                </section>
                <section>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Who to follow</h3>
                    <SuggestedUsers />
                </section>
            </div>
        </div>
    );
}
