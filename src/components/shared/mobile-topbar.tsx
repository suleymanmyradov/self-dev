'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Bell, Leaf } from 'lucide-react';
import { useUnreadCount } from '@/hooks';
import { NotificationsList } from '@/components/layout/left-nested-panel';

export const MobileTopBar = memo(function MobileTopBar() {
  const unreadCount = useUnreadCount();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur md:hidden"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground shadow-sm">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Growth</span>
        </Link>

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="relative border border-border/60 bg-background/80 shadow-sm hover:bg-muted/50"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary"
              />
            )}
          </Button>
        </div>
      </div>

      {/* Notifications sheet — slides in from the right */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent side="right" className="w-[320px] max-w-[85vw] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border/40 shrink-0">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription className="sr-only">
              Your recent notifications and alerts
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <NotificationsList onClose={() => setNotificationsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
});
