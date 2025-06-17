'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Bot, MessageCircle, Target, User } from 'lucide-react';

const tabItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/ai-coach', icon: Bot, label: 'Coach' },
    { href: '/ai-therapist', icon: MessageCircle, label: 'Therapist' },
    { href: '/habits', icon: Target, label: 'Habits' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav className="h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2">
            {tabItems.map(item => {
                const isActive =
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0',
                            isActive ? 'text-blue-600' : 'text-gray-600',
                        )}
                    >
                        <item.icon
                            className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')}
                        />
                        <span className="truncate">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
