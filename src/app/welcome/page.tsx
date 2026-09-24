import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">You&apos;re all set</h1>
            <p className="mt-3 text-muted-foreground">
                Thanks for subscribing. Your plan unlocks automatically — it can take a moment for
                the confirmation to arrive.
            </p>
            <Button asChild className="mt-8">
                <Link href="/">Back to your plan</Link>
            </Button>
        </div>
    );
}
