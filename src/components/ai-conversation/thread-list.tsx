import type { FC } from 'react';
import { ThreadListItemPrimitive, ThreadListPrimitive, useThreadListItem } from '@assistant-ui/react';
import { ArchiveIcon, ArchiveRestoreIcon, SearchIcon, TrashIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import type { Conversation } from '@/api';

interface ThreadListProps {
    conversations?: Conversation[];
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export const ThreadList: FC<ThreadListProps> = ({ conversations, searchQuery = '', onSearchChange }) => {
    // Build a lookup map so ThreadListItem can access timestamp + preview
    const convMap = new Map<string, Conversation>();
    conversations?.forEach(c => convMap.set(c.id, c));

    return (
        <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-3">
            {/* Search field */}
            <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={e => onSearchChange?.(e.target.value)}
                    className="h-8 rounded-lg border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground"
                />
            </div>

            <ThreadListItems convMap={convMap} />
        </ThreadListPrimitive.Root>
    );
};

const ThreadListItems: FC<{ convMap: Map<string, Conversation> }> = ({ convMap }) => {
    return <ThreadListPrimitive.Items components={{ ThreadListItem: () => <ThreadListItem convMap={convMap} /> }} />;
};

const ThreadListItem: FC<{ convMap: Map<string, Conversation> }> = ({ convMap }) => {
    const threadId = useThreadListItem(s => s.id);
    const isActive = useThreadListItem(s => s.isMain);
    const conv = convMap.get(threadId);

    return (
        <ThreadListItemPrimitive.Root className="aui-thread-list-item group relative flex flex-col gap-0.5 rounded-lg border border-transparent px-3 py-2 transition-[border-color,background-color] hover:border-border/60 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-active:border-border data-active:bg-secondary">
            <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger min-w-0 flex-grow text-start">
                <div className="flex items-start justify-between gap-2">
                    <ThreadListItemTitle />
                    {conv && <ThreadListItemTimestamp date={conv.updatedAt} />}
                </div>
                {conv?.lastMessage && (
                    <p className="aui-thread-list-item-preview mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {conv.lastMessage}
                    </p>
                )}
            </ThreadListItemPrimitive.Trigger>

            {/* Action buttons — replace the timestamp in the top-right on hover */}
            {!isActive && (
                <div className="absolute right-2 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <ThreadListItemArchiveToggle />
                    <ThreadListItemDelete />
                </div>
            )}
        </ThreadListItemPrimitive.Root>
    );
};

const ThreadListItemTitle: FC = () => {
    return (
        <span className="aui-thread-list-item-title block truncate text-sm font-medium leading-5 text-foreground">
            <ThreadListItemPrimitive.Title fallback="New Chat" />
        </span>
    );
};

function formatThreadTimestamp(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `TODAY · ${hours}:${minutes}`;
    }
    if (isYesterday) return 'YESTERDAY';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ThreadListItemTimestamp: FC<{ date: string }> = ({ date }) => {
    return (
        <span className="aui-thread-list-item-timestamp shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground transition-opacity duration-150 group-hover:opacity-0">
            {formatThreadTimestamp(date)}
        </span>
    );
};

const ThreadListItemArchiveToggle: FC = () => {
    const isArchived = useThreadListItem(s => s.status === 'archived');
    return isArchived ? (
        <ThreadListItemPrimitive.Unarchive asChild>
            <TooltipIconButton
                className="aui-thread-list-item-unarchive size-5 p-0 text-muted-foreground hover:text-foreground"
                variant="ghost"
                tooltip="Unarchive chat"
            >
                <ArchiveRestoreIcon className="size-3" />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Unarchive>
    ) : (
        <ThreadListItemPrimitive.Archive asChild>
            <TooltipIconButton
                className="aui-thread-list-item-archive size-5 p-0 text-muted-foreground hover:text-foreground"
                variant="ghost"
                tooltip="Archive chat"
            >
                <ArchiveIcon className="size-3" />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Archive>
    );
};

const ThreadListItemDelete: FC = () => {
    return (
        <ThreadListItemPrimitive.Delete asChild>
            <TooltipIconButton
                className="aui-thread-list-item-delete size-5 p-0 text-muted-foreground hover:text-destructive"
                variant="ghost"
                tooltip="Delete chat"
            >
                <TrashIcon className="size-3" />
            </TooltipIconButton>
        </ThreadListItemPrimitive.Delete>
    );
};
