'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MoreMenu } from './more-menu';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { useUI } from '@/store/uiStore';
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
    { href: '/ai-coach', label: 'Coach AI', icon: MessageSquare },
    { href: '/ai-therapist', label: 'Therapist AI', icon: HeartHandshake },
    { href: '/habits', label: 'Habits', icon: ListTodo },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/explore', label: 'Explore', icon: BookOpen },
    { href: '/community', label: 'Community', icon: Users },
];

export function SidebarNav() {
    const { isSidebarCollapsed, openLeftPanel, isMobile, closeLeftPanel, isLeftPanelOpen, leftPanelType } = useUI();

    return (
        <div className="flex h-full w-full flex-col border-r bg-background">
            {/* Brand/Header */}
            <div className="px-3 py-4">
                <div className={cn('flex items-center', isSidebarCollapsed ? 'justify-center' : 'justify-start') }>
                    <Link href="/" className={cn('flex items-center gap-3', isSidebarCollapsed && 'gap-0') }>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                            <span className="text-base font-bold text-primary-foreground">G</span>
                        </div>
                        {!isSidebarCollapsed && <span className="text-lg font-bold">Growth</span>}
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto no-scrollbar">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={e => {
                                if (item.href === '/search') {
                                    // Desktop: open/toggle the left panel; Mobile: navigate to page
                                    if (!isMobile) {
                                        e.preventDefault();
                                        if (isLeftPanelOpen && leftPanelType === 'search') {
                                            closeLeftPanel();
                                        } else {
                                            openLeftPanel('search');
                                        }
                                        return;
                                    }
                                }
                                if (item.href === '/notifications') {
                                    // Desktop: open/toggle the left panel; Mobile: navigate to page (if created later)
                                    if (!isMobile) {
                                        e.preventDefault();
                                        if (isLeftPanelOpen && leftPanelType === 'notifications') {
                                            closeLeftPanel();
                                        } else {
                                            openLeftPanel('notifications');
                                        }
                                        return;
                                    }
                                }
                                // For all other items (e.g., Home), close any open left nested panel
                                closeLeftPanel();
                            }}
                            className={cn(
                                'flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent',
                                isSidebarCollapsed ? 'justify-center gap-0' : 'gap-3',
                            )}
                            title={isSidebarCollapsed ? item.label : undefined}
                        >
                            <Icon className="h-5 w-5" />
                            {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
            {/* Footer */}
            <div className="border-t px-3 py-3">
                <div className="flex flex-col gap-2">
                    {isSidebarCollapsed ? (
                        <Button asChild className="w-full justify-center" variant="secondary" size="icon" title="Profile">
                            <Link href="/profile">
                                <User className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className="w-full justify-start" variant="secondary" size="sm">
                            <Link href="/profile">
                                <User className="mr-2 h-4 w-4" /> Profile
                            </Link>
                        </Button>
                    )}
                    <MoreMenu collapsed={isSidebarCollapsed} />
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
    const { isSidebarCollapsed } = useUI();

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
                                isSidebarCollapsed
                                    ? { children: item.label, side: 'right' }
                                    : undefined
                            }
                            className={cn(
                                isSidebarCollapsed ? 'flex justify-center items-center p-0' : 'flex items-center',
                            )}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex items-center w-full h-full',
                                    isSidebarCollapsed ? 'justify-center' : 'justify-start',
                                )}
                            >
                                {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                                {!isSidebarCollapsed && (
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
