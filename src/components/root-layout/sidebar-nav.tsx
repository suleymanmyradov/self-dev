'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Home,
    Bot,
    MessageCircle,
    Target,
    CheckSquare,
    Bell,
    User,
    Search,
    Mail,
    Bookmark,
    Users,
    LucideIcon,
} from 'lucide-react';
import { useUI } from '@/store/uiStore';
import {
    Sidebar,
    SidebarHeader,
    SidebarTrigger,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    useSidebar,
} from '../ui/sidebar';
import { ModeToggle } from '../shared/mode-toggle';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/messages', icon: Mail, label: 'Messages' },
    { href: '/goals', icon: Bookmark, label: 'Goals' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/ai-coach', icon: Bot, label: 'AI Coach' },
    { href: '/ai-therapist', icon: MessageCircle, label: 'AI Therapist' },
    { href: '/habits', icon: Target, label: 'Habits' },
    { href: '/todo', icon: CheckSquare, label: 'To-Do' },
    { href: '/profile', icon: User, label: 'Profile' },
];

export function PrimarySidebar() {
    const { openRightPanel } = useUI();
    const { state, toggleSidebar } = useSidebar();

    return (
        <Sidebar
            collapsible="icon"
            className="bg-background border-r"
            style={
                {
                    '--sidebar-width': '240px',
                    '--sidebar-width-icon': '64px',
                } as React.CSSProperties
            }
        >
            <SidebarHeader className="p-4 border-b ">
                <div className="flex items-center justify-between">
                    {state === 'expanded' && <h1 className="text-xl font-bold">Self Dev AI</h1>}
                    <SidebarTrigger
                        onClick={toggleSidebar}
                        aria-label={state === 'collapsed' ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    />
                </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <NavMain
                        items={navItems.map(item => ({
                            label: item.label,
                            href: item.href,
                            icon: item.icon,
                        }))}
                    />
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2 border-t border-gray-200">
                <SidebarMenu>
                    <SidebarMenuItem className="flex justify-center">
                        <SidebarMenuButton
                            onClick={() => openRightPanel('notifications')}
                            tooltip="Notifications"
                            className={cn(
                                'text-gray-700 hover:bg-gray-100',
                                state === 'collapsed' && 'justify-center',
                            )}
                        >
                            <Bell className="h-5 w-5 flex-shrink-0" />
                            {state !== 'collapsed' && (
                                <span className="ml-2 truncate">Notifications</span>
                            )}
                        </SidebarMenuButton>
                        <ModeToggle />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
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
