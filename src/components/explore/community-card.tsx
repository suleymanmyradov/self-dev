import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  title: string;
  description: string;
  discordUrl: string;
  xUrl: string;
}

export function CommunityCard({ title, description, discordUrl, xUrl }: CommunityCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-normal leading-tight tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm" className="h-8 rounded-lg text-xs">
          <Link href={discordUrl} target="_blank" rel="noopener noreferrer">
            Join Discord
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
          <Link href={xUrl} target="_blank" rel="noopener noreferrer">
            Follow on X
          </Link>
        </Button>
      </div>
    </div>
  );
}
