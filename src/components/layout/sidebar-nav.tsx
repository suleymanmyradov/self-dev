'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MoreMenu } from './more-menu';
import { NavButton } from './nav-button';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useShallow } from 'zustand/react/shallow';
import { useUnreadCount } from '@/hooks';
import {
  Leaf,
  Target,
  BarChart3,
  HandFist,
  Compass,
  User,
  Bell,
  Sun,
} from 'lucide-react';

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Today', icon: Sun },
  { href: '/plan', label: 'Plan', icon: Target },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/coach', label: 'Coach', icon: HandFist },
  { href: '/library', label: 'Library', icon: Compass },
  { href: '/me', label: 'Me', icon: User },
];

export const SidebarNav = memo(function SidebarNav() {
  const pathname = usePathname();
  const { isLeftPanelOpen, leftPanelType } = useUIStore(
    useShallow(s => ({
      isLeftPanelOpen: s.isLeftPanelOpen,
      leftPanelType: s.leftPanelType,
    }))
  );
  const openLeftPanel = useUIStore(s => s.openLeftPanel);
  const closeLeftPanel = useUIStore(s => s.closeLeftPanel);
  const unreadCount = useUnreadCount();

  const handlePanelClick = (panel: "notifications") => {
    if (isLeftPanelOpen && leftPanelType === panel) {
      closeLeftPanel();
    } else {
      openLeftPanel(panel);
    }
  };

  return (
    <div className="flex h-full flex-col items-center px-2 py-4">
        <Link
          href="/"
          onClick={() => closeLeftPanel()}
          className={cn(
            'mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-muted text-foreground shadow-sm transition-colors duration-200 hover:border-border',
            pathname === '/' && 'ring-1 ring-border/60',
          )}
          aria-label="Go to home"
        >
          <Leaf className="h-[18px] w-[18px]" />
        </Link>

      {/* Main navigation */}
      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Primary">
        {navItems.map((item) => (
          <NavButton
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
            onClick={closeLeftPanel}
          />
        ))}

        <div className="my-2 h-px w-8 bg-border/60" />

        {/* Notifications panel toggle */}
        <div className="relative">
          <NavButton
            label="Alerts"
            icon={Bell}
            isActive={isLeftPanelOpen && leftPanelType === 'notifications'}
            onClick={() => handlePanelClick('notifications')}
          />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 pt-4">
          <MoreMenu />
        </div>
      </nav>
    </div>
  );
});
