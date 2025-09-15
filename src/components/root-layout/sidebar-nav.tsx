'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoreMenu } from './more-menu';
import {
    Home,
    Search,
    Bell,
    MessageSquare,
    HeartHandshake,
    ListTodo,
    Target,
    BookOpen,
    Users,
    User,
} from 'lucide-react';

const menuItems = [
    { href: '/', label: 'Feed', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/coach', label: 'Coach AI', icon: MessageSquare },
    { href: '/therapist', label: 'Therapist AI', icon: HeartHandshake },
    { href: '/habits', label: 'Habits', icon: ListTodo },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/explore', label: 'Explore', icon: BookOpen },
    { href: '/community', label: 'Community', icon: Users },
];

export function SidebarNav() {
    return (
        <div className="flex h-full w-full flex-col border-r bg-background">
            {/* Brand/Header */}
            <div className="px-3 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                        <span className="text-base font-bold text-primary-foreground">G</span>
                    </div>
                    <span className="text-lg font-bold">Growth</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto no-scrollbar">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            {/* Footer */}
            <div className="border-t px-3 py-3">
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full justify-start" variant="secondary" size="sm">
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                    </Button>
                    <MoreMenu />
                </div>
            </div>
        </div>
    );
}

export function NavMain({
    items,
}: {
    items: {
        label: string;
        href: string;
        icon?: LucideIcon;
    }[];
}) {
    const pathname = usePathname();
    const { state } = useSidebar();

    return (
        <SidebarMenu>
            {items.map(item => {
                const isActive =
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={
                                state === 'collapsed'
                                    ? { children: item.label, side: 'right' }
                                    : undefined
                            }
                            className={cn(
                                state === 'collapsed'
                                    ? 'flex justify-center items-center p-0'
                                    : 'flex items-center',
                            )}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex items-center w-full h-full',
                                    state === 'collapsed' ? 'justify-center' : 'justify-start',
                                )}
                            >
                                {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                                {state !== 'collapsed' && (
                                    <span className="ml-2 truncate">{item.label}</span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
