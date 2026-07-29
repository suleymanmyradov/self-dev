'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Leaf } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useUnreadCount } from '@/hooks';

export const MobileTopBar = memo(function MobileTopBar() {
  const openLeftPanel = useUIStore(s => s.openLeftPanel);
  const closeLeftPanel = useUIStore(s => s.closeLeftPanel);
  const isLeftPanelOpen = useUIStore(s => s.isLeftPanelOpen);
  const leftPanelType = useUIStore(s => s.leftPanelType);
  const unreadCount = useUnreadCount();

  const handleBellClick = () => {
    if (isLeftPanelOpen && leftPanelType === 'notifications') {
      closeLeftPanel();
    } else {
      openLeftPanel('notifications');
    }
  };

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
            onClick={handleBellClick}
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
    </header>
  );
});
