import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { PremiumCard } from '../shared/premium-card';
import { TrendingTopics } from '../shared/trending-topics';
import { SuggestedUsers } from '../shared/suggested-users';

export function RightSidebar() {
    return (
        <div className="hidden w-80 mr-2 lg:block flex-shrink-0">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search" className="pl-9" />
                    </div>
                </div>

                <PremiumCard />

                <Card className="mb-4">
                    <CardHeader className="pb-2">
                        <h3 className="text-lg font-bold">What's happening</h3>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <TrendingTopics />
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full justify-start text-primary">
                            Show more
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <h3 className="text-lg font-bold">Who to follow</h3>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <SuggestedUsers />
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full justify-start text-primary">
                            Show more
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
