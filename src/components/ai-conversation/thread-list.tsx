'use client';

import type { FC } from 'react';
import { ArchiveIcon, ArchiveRestoreIcon, SearchIcon, TrashIcon } from 'lucide-react';

import type { Conversation } from '@/api';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ThreadListProps {
    conversations?: Conversation[];
    activeConversationId?: string;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onSelectConversation?: (id: string) => void;
    onArchive?: (id: string) => void;
    onUnarchive?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ThreadList: FC<ThreadListProps> = ({
    conversations = [],
    activeConversationId,
    searchQuery = '',
    onSearchChange,
    onSelectConversation,
    onArchive,
    onUnarchive,
    onDelete,
}) => {
    const activeConversations = conversations.filter(conversation => !conversation.archived);
    const archivedConversations = conversations.filter(conversation => conversation.archived);

    return (
        <div className="aui-root aui-thread-list-root flex flex-col items-stretch gap-3">
            <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={event => onSearchChange?.(event.target.value)}
                    className="h-8 rounded-lg border-border bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground"
                    aria-label="Search conversations"
                />
            </div>

            {activeConversations.length > 0 && (
                <div className="flex flex-col gap-1">
                    {activeConversations.map(conversation => (
                        <ThreadListItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={conversation.id === activeConversationId}
                            onSelect={onSelectConversation}
                            onArchive={onArchive}
                            onUnarchive={onUnarchive}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            {archivedConversations.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Archived
                    </p>
                    {archivedConversations.map(conversation => (
                        <ThreadListItem
                            key={conversation.id}
                            conversation={conversation}
                            isActive={conversation.id === activeConversationId}
                            onSelect={onSelectConversation}
                            onArchive={onArchive}
                            onUnarchive={onUnarchive}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            {activeConversations.length === 0 && archivedConversations.length === 0 && (
                <p className="px-3 py-4 text-xs text-muted-foreground">No conversations found.</p>
            )}
        </div>
    );
};

interface ThreadListItemProps {
    conversation: Conversation;
    isActive: boolean;
    onSelect?: (id: string) => void;
    onArchive?: (id: string) => void;
    onUnarchive?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const ThreadListItem: FC<ThreadListItemProps> = ({
    conversation,
    isActive,
    onSelect,
    onArchive,
    onUnarchive,
    onDelete,
}) => {
    return (
        <div
            className={cn(
                'aui-thread-list-item group relative flex flex-col gap-0.5 rounded-lg border border-transparent px-3 py-2 transition-[border-color,background-color] hover:border-border/60 hover:bg-muted/40 focus-within:bg-muted/40 focus-within:ring-2 focus-within:ring-ring focus-within:outline-none',
                isActive && 'border-border bg-secondary',
            )}
            data-active={isActive ? '' : undefined}
        >
            <button
                type="button"
                onClick={() => onSelect?.(conversation.id)}
                className="aui-thread-list-item-trigger min-w-0 flex-grow text-start"
                aria-current={isActive ? 'page' : undefined}
            >
                <div className="flex items-start justify-between gap-2">
                    <span className="aui-thread-list-item-title block truncate text-sm font-medium leading-5 text-foreground">
                        {conversation.title || 'New Chat'}
                    </span>
                    <span className="aui-thread-list-item-timestamp shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground transition-opacity duration-150 group-hover:opacity-0">
                        {formatThreadTimestamp(conversation.updatedAt)}
                    </span>
                </div>
                {conversation.lastMessage && (
                    <p className="aui-thread-list-item-preview mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {conversation.lastMessage}
                    </p>
                )}
            </button>

            {!isActive && (
                <div className="absolute right-2 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                    {conversation.archived ? (
                        <TooltipIconButton
                            className="aui-thread-list-item-unarchive size-5 p-0 text-muted-foreground hover:text-foreground"
                            variant="ghost"
                            tooltip="Unarchive chat"
                            onClick={() => onUnarchive?.(conversation.id)}
                            aria-label="Unarchive chat"
                        >
                            <ArchiveRestoreIcon className="size-3" />
                        </TooltipIconButton>
                    ) : (
                        <TooltipIconButton
                            className="aui-thread-list-item-archive size-5 p-0 text-muted-foreground hover:text-foreground"
                            variant="ghost"
                            tooltip="Archive chat"
                            onClick={() => onArchive?.(conversation.id)}
                            aria-label="Archive chat"
                        >
                            <ArchiveIcon className="size-3" />
                        </TooltipIconButton>
                    )}
                    <TooltipIconButton
                        className="aui-thread-list-item-delete size-5 p-0 text-muted-foreground hover:text-destructive"
                        variant="ghost"
                        tooltip="Delete chat"
                        onClick={() => onDelete?.(conversation.id)}
                        aria-label="Delete chat"
                    >
                        <TrashIcon className="size-3" />
                    </TooltipIconButton>
                </div>
            )}
        </div>
    );
};

function formatThreadTimestamp(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `TODAY ${hours}:${minutes}`;
    }
    if (isYesterday) return 'YESTERDAY';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
