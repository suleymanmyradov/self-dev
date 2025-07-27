'use client';

import {
    Bell,
    Bookmark,
    Briefcase,
    Home,
    Mail,
    MessageSquare,
    Search,
    Users,
    Plus,
    MoreHorizontal,
    BrainCircuit,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useRightSidebar } from '@/app/layout';
import { ChatConversations } from '../sidebar-content/chat-conversation';
import { NotificationsList } from '../sidebar-content/notification-list';
import { SearchResults } from '../sidebar-content/search-results';

const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: Mail },
    { href: '/coach', label: 'Virtual Coach', icon: MessageSquare },
    { href: '/goals', label: 'Goals', icon: Bookmark },
    { href: '/jobs', label: 'Opportunities', icon: Briefcase },
    { href: '/community', label: 'Community', icon: Users },
];

export function SidebarNav() {
    const { setTheme } = useTheme();
    const pathname = usePathname();
    const { openSidebar } = useRightSidebar();

    const handleMenuClick = (item: (typeof menuItems)[0]) => {
        // Open right sidebar based on menu item
        switch (item.href) {
            case '/coach':
                openSidebar(<ChatConversations />, 'AI Coach Conversations', {
                    searchPlaceholder: 'Search conversations...',
                });
                break;
            case '/notifications':
                openSidebar(<NotificationsList />, 'Notifications', { showUnreads: true });
                break;
            case '/explore':
                openSidebar(<SearchResults />, 'Search Results', {
                    searchPlaceholder: 'Search everything...',
                });
                break;
            case '/messages':
                openSidebar(<ChatConversations />, 'Messages', {
                    searchPlaceholder: 'Search messages...',
                });
                break;
            default:
                // Don't open sidebar for other routes
                break;
        }
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center rounded-lg w-8 h-8">
                                    <BrainCircuit className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">MindFlow</span>
                                    <span className="truncate text-xs">Personal Growth</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                                    <Link
                                        href={item.href}
                                        onClick={() => handleMenuClick(item)}
                                        className="flex items-center gap-2"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>

                <div className="px-3 py-4">
                    <Button className="w-full justify-start gap-2" size="lg">
                        <Plus className="h-4 w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Post Update</span>
                    </Button>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <Link href="/profile" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src="/placeholder.svg?height=32&width=32"
                                        alt="User Avatar"
                                    />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">User Name</span>
                                    <span className="truncate text-xs">@username</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="end" className="w-48">
                                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                    Light Mode
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                    Dark Mode
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                    System
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
