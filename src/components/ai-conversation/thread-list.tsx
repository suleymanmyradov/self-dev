import type { FC } from 'react';
import { ThreadListItemPrimitive, ThreadListPrimitive, useThreadListItem } from '@assistant-ui/react';
import { ArchiveIcon, ArchiveRestoreIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';

export const ThreadList: FC = () => {
    return (
        <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-2">
            <ThreadListNew />
            <ThreadListItems />
        </ThreadListPrimitive.Root>
    );
};

const ThreadListNew: FC = () => {
    return (
        <ThreadListPrimitive.New asChild>
            <Button
                className="aui-thread-list-new h-8 justify-start gap-2 rounded-lg px-3 text-start text-xs font-medium"
                variant="calm"
            >
                <PlusIcon className="size-3.5" />
                New Chat
            </Button>
        </ThreadListPrimitive.New>
    );
};

const ThreadListItems: FC = () => {
    return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
    return (
        <ThreadListItemPrimitive.Root className="aui-thread-list-item group flex items-center gap-2 rounded-lg border border-transparent transition-all hover:border-border/60 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:border-calm/30 data-active:bg-calm-soft/40">
            <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger min-w-0 flex-grow px-3 py-1.5 text-start">
                <ThreadListItemTitle />
            </ThreadListItemPrimitive.Trigger>
            <div className="mr-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <ThreadListItemArchiveToggle />
                <ThreadListItemDelete />
            </div>
        </ThreadListItemPrimitive.Root>
    );
};

const ThreadListItemTitle: FC = () => {
    return (
        <span className="aui-thread-list-item-title block truncate text-xs font-medium leading-4">
            <ThreadListItemPrimitive.Title fallback="New Chat" />
        </span>
    );
};

const ThreadListItemArchiveToggle: FC = () => {
    const isArchived = useThreadListItem(s => s.status === 'archived');
    return isArchived ? (
        <ThreadListItemPrimitive.Unarchive asChild>
            <TooltipIconButton
                className="aui-thread-list-item-unarchive size-4 p-0 text-foreground hover:text-primary"
                variant="ghost"
                tooltip="Unarchive chat"
            >
                <ArchiveRestoreIcon />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Unarchive>
    ) : (
        <ThreadListItemPrimitive.Archive asChild>
            <TooltipIconButton
                className="aui-thread-list-item-archive size-4 p-0 text-foreground hover:text-primary"
                variant="ghost"
                tooltip="Archive chat"
            >
                <ArchiveIcon />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Archive>
    );
};

const ThreadListItemDelete: FC = () => {
    return (
        <ThreadListItemPrimitive.Delete asChild>
            <TooltipIconButton
                className="aui-thread-list-item-delete size-4 p-0 text-foreground hover:text-destructive"
                variant="ghost"
                tooltip="Delete chat"
            >
                <TrashIcon />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Delete>
    );
};
