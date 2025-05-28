import { Bell, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '../shared/mode-toggle';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between px-4 max-w-full">
                {/* Left: Logo */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">G</span>
                        </div>
                        <span className="hidden text-xl font-bold md:inline-block">Growth</span>
                    </Link>
                </div>

                {/* Center: Search */}
                <div className="hidden md:flex flex-1 justify-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search Growth" className="w-full pl-9" />
                    </div>
                </div>

                {/* Right: Icons/Avatar */}
                <div className="flex items-center gap-2 mr-4">
                    <div className="hidden md:flex md:items-center md:gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/notifications">
                                <Bell className="h-5 w-5" />
                                <span className="sr-only">Notifications</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/messages">
                                <MessageSquare className="h-5 w-5" />
                                <span className="sr-only">Messages</span>
                            </Link>
                        </Button>
                        <ModeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src="/placeholder.svg?height=32&width=32"
                                        alt="@user"
                                    />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/goals">Goals</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
