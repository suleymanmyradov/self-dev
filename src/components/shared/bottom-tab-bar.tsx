"use client";

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, User, Target, HandFist, Compass } from 'lucide-react';

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/ai-coach", label: "Coach", icon: HandFist },
  { href: "/profile", label: "Profile", icon: User },
];

export const BottomTabBar = memo(function BottomTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/90 backdrop-blur md:hidden safe-area-bottom">
      <nav className="flex h-16 items-center justify-around px-3">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[0.65rem]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});
