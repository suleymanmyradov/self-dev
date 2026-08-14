'use client';

import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    Mic,
    MoreHorizontal,
    PanelLeftOpen,
    TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationHeaderProps {
    title?: string;
    onOpenConversations: () => void;
    onVoiceMode: () => void;
    /** When set, conversation actions (archive/delete) are shown. */
    conversationId?: string;
    isArchived?: boolean;
    onArchive?: (id: string) => void;
    onUnarchive?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ConversationHeader = ({
    title,
    onOpenConversations,
    onVoiceMode,
    conversationId,
    isArchived,
    onArchive,
    onUnarchive,
    onDelete,
}: ConversationHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 shrink-0 md:hidden"
                    onClick={onOpenConversations}
                    aria-label="Open conversations"
                >
                    <PanelLeftOpen className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                        {title || 'New conversation'}
                    </h3>
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                        Coach can see your habits, check-ins and last 4 reviews
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg border-border text-xs font-medium"
                    onClick={onVoiceMode}
                >
                    <Mic className="size-3.5" />
                    Voice
                </Button>
                {conversationId && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground"
                                aria-label="More options"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isArchived ? (
                                <DropdownMenuItem onClick={() => onUnarchive?.(conversationId)}>
                                    <ArchiveRestoreIcon className="mr-2 size-4" />
                                    Unarchive
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onArchive?.(conversationId)}>
                                    <ArchiveIcon className="mr-2 size-4" />
                                    Archive
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete?.(conversationId)}
                            >
                                <TrashIcon className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
