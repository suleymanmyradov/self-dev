'use client';

import Link from 'next/link';
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
    const { openLeftPanel, isMobile, closeLeftPanel, isLeftPanelOpen, leftPanelType } = useUI();

    return (
        <div className="flex h-full w-full flex-col bg-background overflow-hidden">
            {/* Brand/Header */}
            <div className="px-3 h-[72px] flex items-center shrink-0">
                <div className="flex items-center w-full justify-center group-hover:justify-start transition-all duration-200">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary flex-shrink-0">
                            <span className="text-base font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="text-lg font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-0 group-hover:w-auto overflow-hidden">Growth</span>
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-3 py-2 overflow-y-auto no-scrollbar">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={e => {
                                if (item.href === '/search') {
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
                                closeLeftPanel();
                            }}
                            className="flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-4 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-all duration-200 w-full"
                            title={item.label}
                        >
                            <Icon className="h-6 w-6 flex-shrink-0" strokeWidth={1.8} />
                            <span className="font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-0 group-hover:w-auto overflow-hidden">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            
            {/* Footer */}
            <div className="px-3 py-3 mt-auto shrink-0">
                <div className="flex flex-col gap-2">
                    <Link 
                        href="/profile"
                        className="flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-4 rounded-lg px-3 py-3 text-sm hover:bg-accent transition-all duration-200 w-full"
                        title="Profile"
                    >
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-0 group-hover:w-auto overflow-hidden">Profile</span>
                    </Link>
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
