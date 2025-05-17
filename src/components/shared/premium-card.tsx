import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PremiumCard() {
    return (
        <Card className="mb-4 bg-muted/20">
            <CardHeader className="pb-2">
                <CardTitle>Subscribe to Premium</CardTitle>
                <CardDescription>
                    Get exclusive features to enhance your self-development journey
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" variant="default">
                    Subscribe
                </Button>
            </CardContent>
        </Card>
    );
}
