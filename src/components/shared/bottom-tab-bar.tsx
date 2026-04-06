"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Brain, User, Target, HandFist} from 'lucide-react';

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/ai-coach", label: "Coach", icon: HandFist },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomTabBar() {
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
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[0.65rem]">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
