import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CommunityCard() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-calm-soft/50 to-growth-soft/30 p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg">Connect with the Community</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm text-muted-foreground mb-4">
            Join others on their growth journey. Share insights, get support, and stay motivated.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="default" variant="calm" className="justify-start">
              <Link href="https://discord.com/invite/your-server" target="_blank" rel="noopener noreferrer">
                Join Discord
              </Link>
            </Button>
            <Button asChild size="default" variant="outline" className="justify-start">
              <Link href="https://x.com/your-handle" target="_blank" rel="noopener noreferrer">
                Follow on X
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
