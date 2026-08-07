'use client';

import { ArchiveIcon, ArchiveRestoreIcon, Mic, MoreHorizontal, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationHeaderProps {
    title?: string;
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
    onVoiceMode,
    conversationId,
    isArchived,
    onArchive,
    onUnarchive,
    onDelete,
}: ConversationHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b border-border bg-card px-8 py-3">
            <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground">
                    {title || 'New conversation'}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Coach can see your habits, check-ins and last 4 reviews
                </p>
            </div>
            <div className="flex items-center gap-2">
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
