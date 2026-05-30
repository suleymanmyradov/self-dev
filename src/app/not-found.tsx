import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/habits">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My habits
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
