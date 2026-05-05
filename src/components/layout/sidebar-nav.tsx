'use client';

import Link from 'next/link';
import { MoreMenu } from './more-menu';
import { NavButton } from './nav-button';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/uiStore';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Leaf,
  Target,
  Brain,
  Compass,
  User,
  Sparkles,
  HandFist,
  Bell,
} from 'lucide-react';

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/goals", label: "Goals", icon: Brain },
  { href: "/explore", label: "Explore", icon: Compass },
];

const supportRoutes: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/ai-coach", label: "Coach", icon: HandFist },
];

const panelItems: { panel: "notifications"; label: string; icon: LucideIcon }[] = [
  { panel: "notifications", label: "Notifications", icon: Bell },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { isSidebarCollapsed, openLeftPanel, isLeftPanelOpen, leftPanelType, closeLeftPanel } = useUI();

  const handlePanelClick = (panel: "notifications") => {
    if (isLeftPanelOpen && leftPanelType === panel) {
      closeLeftPanel();
    } else {
      openLeftPanel(panel);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col items-center px-2 py-4">
          <Link
            href="/"
            onClick={() => closeLeftPanel()}
            className={cn(
              'mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-border/60 bg-gradient-to-br from-calm/20 to-growth/20 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md',
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
              isActive={pathname === item.href}
              isCollapsed={isSidebarCollapsed}
              onClick={closeLeftPanel}
            />
          ))}

          <div className="my-2 h-px w-8 bg-border/60" />

          {/* Support routes */}
          {supportRoutes.map((item) => (
            <NavButton
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              isCollapsed={isSidebarCollapsed}
            />
          ))}

          <div className="my-2 h-px w-8 bg-border/60" />

          {/* Panel toggles */}
          {panelItems.map((item) => (
            <NavButton
              key={item.panel}
              label={item.label}
              icon={item.icon}
              isActive={isLeftPanelOpen && leftPanelType === item.panel}
              isCollapsed={isSidebarCollapsed}
              onClick={() => handlePanelClick(item.panel)}
            />
          ))}

          <div className="mt-auto flex flex-col items-center gap-2 pt-4">
            <NavButton
              href="/profile"
              label="Profile"
              icon={User}
              isActive={pathname === '/profile'}
              isCollapsed={isSidebarCollapsed}
              onClick={closeLeftPanel}
            />

            <MoreMenu />
          </div>
        </nav>
      </div>
    </TooltipProvider>
  );
}
