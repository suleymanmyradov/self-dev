import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
    return (
        <footer className="border-t bg-background relative z-20 md:pl-[var(--sidebar-width)]">
            <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0 max-w-[1500px]">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
                    <Link href="/" className="flex items-center gap-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <span className="text-xs font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="text-sm font-semibold">Growth</span>
                    </Link>
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} Growth. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/privacy">Privacy</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/terms">Terms</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/contact">Contact</Link>
                    </Button>
                </div>
            </div>
        </footer>
    );
}
