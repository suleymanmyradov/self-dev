'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/coach', label: 'Coach', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                className={cn(
                  'flex h-14 w-full flex-col items-center justify-center gap-1 text-xs transition-transform',
                  active ? 'text-foreground scale-105 font-medium' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 transition-all', active && 'stroke-[2.5]')} />
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
