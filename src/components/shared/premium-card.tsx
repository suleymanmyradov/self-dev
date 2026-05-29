import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PremiumCard() {
    return (
        <Card className="mb-4 overflow-hidden border-border/70 bg-gradient-to-br from-primary/8 via-background to-muted/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Unlock Growth Pro</CardTitle>
                <CardDescription>
                    Get deeper coaching memory, full weekly history, and unlimited plans.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Link href="/pricing">
                    <Button className="w-full" variant="default">
                        View plans
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
