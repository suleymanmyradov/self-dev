import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PremiumCard() {
    return (
        <Card className="mb-4 overflow-hidden border-border/70 bg-gradient-to-br from-primary/8 via-background to-muted/30">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Unlock Premium</CardTitle>
                <CardDescription>
                    Get exclusive tools, deeper insights, and a calmer workflow.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Button className="w-full" variant="default">
                    Upgrade now
                </Button>
            </CardContent>
        </Card>
    );
}
