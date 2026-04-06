'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function MobileTopBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur md:hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <span className="text-sm font-bold">G</span>
          </div>
          <span className="text-base font-semibold tracking-tight">Growth</span>
        </Link>

        <div className="ml-auto">
          <Button variant="ghost" size="icon" asChild className="relative rounded-full border border-border/60 bg-background/80 shadow-sm hover:bg-muted/50">
            <Link href="/notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {/* Unread badge */}
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-energy"
              />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
