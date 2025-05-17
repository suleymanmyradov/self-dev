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

export function SidebarNav() {
    return (
        <Sidebar className="border-r flex-shrink-0">
            <SidebarContent>
                <div className="px-3 py-2">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
                    >
                        <div className="text-xl font-bold text-primary">G</div>
                    </Link>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/" className="flex items-center gap-4">
                                <Home className="h-6 w-6" />
                                <span className="text-lg font-medium">Home</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/explore" className="flex items-center gap-4">
                                <Search className="h-6 w-6" />
                                <span className="text-lg font-medium">Explore</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/notifications" className="flex items-center gap-4">
                                <Bell className="h-6 w-6" />
                                <span className="text-lg font-medium">Notifications</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/messages" className="flex items-center gap-4">
                                <Mail className="h-6 w-6" />
                                <span className="text-lg font-medium">Messages</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/coach" className="flex items-center gap-4">
                                <MessageSquare className="h-6 w-6" />
                                <span className="text-lg font-medium">Virtual Coach</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/goals" className="flex items-center gap-4">
                                <Bookmark className="h-6 w-6" />
                                <span className="text-lg font-medium">Goals</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/jobs" className="flex items-center gap-4">
                                <Briefcase className="h-6 w-6" />
                                <span className="text-lg font-medium">Opportunities</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/community" className="flex items-center gap-4">
                                <Users className="h-6 w-6" />
                                <span className="text-lg font-medium">Community</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/profile" className="flex items-center gap-4">
                                <User className="h-6 w-6" />
                                <span className="text-lg font-medium">Profile</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-3 py-4">
                    <Button className="w-full" size="lg">
                        Post Update
                    </Button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}
