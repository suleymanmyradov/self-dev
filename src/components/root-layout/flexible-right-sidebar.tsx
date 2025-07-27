'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
} from '@/components/ui/sidebar';
import { useRightSidebar } from '@/app/layout';

export function FlexibleRightSidebar() {
    const { isOpen, content, title, searchPlaceholder, showUnreads, closeSidebar } =
        useRightSidebar();

    if (!isOpen) {
        return null;
    }

    return (
        <Sidebar collapsible="none" className="hidden md:flex w-80 border-l" side="right">
            <SidebarHeader className="gap-3.5 border-b p-4">
                <div className="flex w-full items-center justify-between">
                    <div className="text-base font-medium text-foreground">{title}</div>
                    <div className="flex items-center gap-2">
                        {showUnreads && (
                            <Label className="flex items-center gap-2 text-sm">
                                <span>Unreads</span>
                                <Switch className="shadow-none" />
                            </Label>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closeSidebar}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {searchPlaceholder && <SidebarInput placeholder={searchPlaceholder} />}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-0">
                    <SidebarGroupContent>{content}</SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
