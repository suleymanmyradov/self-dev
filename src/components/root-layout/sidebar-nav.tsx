'use client';

import Link from 'next/link';
import { MoreMenu } from './more-menu';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUI } from '@/store/uiStore';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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

type PanelType = 'search' | 'notifications' | 'messages';

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    panel?: PanelType;
}

const menuItems: MenuItem[] = [
    { href: '/', label: 'Feed', icon: Home },
    { href: '/search', label: 'Search', icon: Search, panel: 'search' },
    { href: '/notifications', label: 'Notifications', icon: Bell, panel: 'notifications' },
    { href: '/ai-coach', label: 'Coach AI', icon: MessageSquare },
    { href: '/ai-therapist', label: 'Therapist AI', icon: HeartHandshake },
    { href: '/habits', label: 'Habits', icon: ListTodo },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/explore', label: 'Explore', icon: BookOpen },
    { href: '/community', label: 'Community', icon: Users },
];

export function SidebarNav() {
    const pathname = usePathname();
    const { openLeftPanel, isMobile, closeLeftPanel, isLeftPanelOpen, leftPanelType } = useUI();

    const handleClick = (e: React.MouseEvent, item: MenuItem) => {
        if (item.panel && !isMobile) {
            e.preventDefault();
            if (isLeftPanelOpen && leftPanelType === item.panel) {
                closeLeftPanel();
            } else {
                openLeftPanel(item.panel);
            }
            return;
        }
        closeLeftPanel();
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-full w-full flex-col overflow-hidden">
                {/* Brand */}
                <div className="flex h-[72px] items-center justify-center shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/" onClick={() => closeLeftPanel()}>
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                                    <span className="text-base font-bold text-primary-foreground">G</span>
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>Growth</TooltipContent>
                    </Tooltip>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 overflow-y-auto no-scrollbar">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive =
                            (!item.panel && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))) ||
                            (item.panel && isLeftPanelOpen && leftPanelType === item.panel);

                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        onClick={e => handleClick(e, item)}
                                        className={cn(
                                            'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                                            isActive
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                        )}
                                    >
                                        <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.7} />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={12}>{item.label}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="flex flex-col items-center gap-1 px-2 py-3 shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/profile"
                                onClick={() => closeLeftPanel()}
                                className={cn(
                                    'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                                    pathname === '/profile'
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                                )}
                            >
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    <User className="h-4 w-4" />
                                </div>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>Profile</TooltipContent>
                    </Tooltip>
                    <MoreMenu />
                </div>
            </div>
        </TooltipProvider>
    );
}

