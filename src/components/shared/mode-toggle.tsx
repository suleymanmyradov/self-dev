'use client';

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@radix-ui/react-dropdown-menu';
import { Sun, Moon, Computer } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';

export function ModeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-background border border-border p-2 rounded-md shadow-md"
            >
                <DropdownMenuItem
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-sm px-2 py-1"
                >
                    <Sun className="size-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-sm px-2 py-1"
                >
                    <Moon className="size-4" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-sm px-2 py-1"
                >
                    <Computer className="size-4" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
