'use client';

import { Mic, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';

interface ConversationHeaderProps {
    title?: string;
    onVoiceMode: () => void;
}

export const ConversationHeader = ({ title, onVoiceMode }: ConversationHeaderProps) => {
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
                <TooltipIconButton
                    tooltip="More options"
                    variant="outline"
                    className="size-8 rounded-lg border-border text-muted-foreground hover:text-foreground"
                >
                    <MoreHorizontal className="size-4" />
                </TooltipIconButton>
            </div>
        </div>
    );
};
