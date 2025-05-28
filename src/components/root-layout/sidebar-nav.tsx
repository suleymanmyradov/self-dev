'use client';

import { useState } from 'react';
import {
    Bell,
    Bookmark,
    Briefcase,
    Home,
    Mail,
    MessageSquare,
    Search,
    User,
    Users,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';

const menuItems = [
    { href: '/', label: 'Home', icon: <Home className="h-6 w-6" /> },
    { href: '/explore', label: 'Explore', icon: <Search className="h-6 w-6" /> },
    { href: '/notifications', label: 'Notifications', icon: <Bell className="h-6 w-6" /> },
    { href: '/messages', label: 'Messages', icon: <Mail className="h-6 w-6" /> },
    { href: '/coach', label: 'Virtual Coach', icon: <MessageSquare className="h-6 w-6" /> },
    { href: '/goals', label: 'Goals', icon: <Bookmark className="h-6 w-6" /> },
    { href: '/jobs', label: 'Opportunities', icon: <Briefcase className="h-6 w-6" /> },
    { href: '/community', label: 'Community', icon: <Users className="h-6 w-6" /> },
    { href: '/profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
];

export function SidebarNav() {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Sidebar
            className={`border-r flex-shrink-0 ${isExpanded ? 'w-64' : 'w-16'} transition-all duration-300`}
        >
            <SidebarContent>
                <div className="px-3 py-2 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
                    >
                        <div className="text-xl font-bold text-primary">G</div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <ChevronLeft className="h-6 w-6" />
                        ) : (
                            <ChevronRight className="h-6 w-6" />
                        )}
                    </Button>
                </div>
                <SidebarMenu>
                    {menuItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild>
                                <Link
                                    href={item.href}
                                    className={`flex items-center ${isExpanded ? 'gap-4 px-4 py-2' : 'justify-center p-4'}`}
                                >
                                    {item.icon}
                                    {isExpanded && (
                                        <span className="text-lg font-medium">{item.label}</span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <div className={`px-3 py-4 ${isExpanded ? '' : 'flex justify-center'}`}>
                    {isExpanded ? (
                        <Button className="w-full" size="lg">
                            Post Update
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon">
                            <Plus className="h-6 w-6" />
                        </Button>
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
