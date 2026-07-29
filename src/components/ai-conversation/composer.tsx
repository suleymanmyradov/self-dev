import { ComposerPrimitive, ThreadPrimitive } from '@assistant-ui/react';
import { ArrowUpIcon, Square, PaperclipIcon, MicIcon, TargetIcon } from 'lucide-react';
import type { FC } from 'react';

import {
    ComposerAddAttachment,
    ComposerAttachments,
} from '@/components/ai-conversation/attachment';
import { DictateButton } from '@/components/ai-conversation/dictate-button';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { Button } from '@/components/ui/button';
import { ThreadWelcomeSuggestions } from './thread-welcome';

const ThreadScrollToBottom: FC = () => {
    return (
        <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
                tooltip="Scroll to bottom"
                variant="outline"
                className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-lg border-border bg-background p-4 shadow-sm disabled:invisible dark:hover:bg-accent"
            >
                <ArrowUpIcon />
            </TooltipIconButton>
        </ThreadPrimitive.ScrollToBottom>
    );
};

export const Composer: FC = () => {
    return (
        <div className="aui-composer-wrapper sticky bottom-0 mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-3 overflow-visible bg-gradient-to-t from-card via-card/95 to-transparent px-8 pb-[26px] pt-6">
            <ThreadScrollToBottom />
            <ThreadPrimitive.Empty>
                <ThreadWelcomeSuggestions />
            </ThreadPrimitive.Empty>
            <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col rounded-xl border border-border bg-card px-4 pt-3 shadow-sm transition-[border-color,background-color] focus-within:border-foreground/20">
                <ComposerAttachments />
                <ComposerPrimitive.Input
                    placeholder="Tell your coach what got in the way…"
                    className="aui-composer-input mb-1 max-h-36 min-h-16 w-full resize-none bg-transparent px-0 pt-0.5 pb-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus:outline-none"
                    rows={1}
                    autoFocus
                    aria-label="Message input"
                />
                <ComposerAction />
            </ComposerPrimitive.Root>
        </div>
    );
};

const ComposerAction: FC = () => {
    return (
        <div className="aui-composer-action-wrapper relative mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <ComposerPillButton icon={<PaperclipIcon className="size-3" />} label="Attach">
                    <ComposerAddAttachment />
                </ComposerPillButton>
                <ComposerPillButton icon={<MicIcon className="size-3" />} label="Dictate">
                    <DictateButton />
                </ComposerPillButton>
                <ComposerPillButton icon={<TargetIcon className="size-3" />} label="Reference a habit" />
            </div>

            <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                    <Button
                        type="submit"
                        size="icon"
                        className="aui-composer-send size-8 rounded-lg bg-secondary p-1 text-secondary-foreground hover:bg-secondary/85"
                        aria-label="Send message"
                    >
                        <ArrowUpIcon className="aui-composer-send-icon size-4" />
                    </Button>
                </ComposerPrimitive.Send>
            </ThreadPrimitive.If>

            <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="aui-composer-cancel size-8 rounded-lg border-border bg-background hover:bg-muted"
                        aria-label="Stop generating"
                    >
                        <Square className="aui-composer-cancel-icon size-3 fill-foreground" />
                    </Button>
                </ComposerPrimitive.Cancel>
            </ThreadPrimitive.If>
        </div>
    );
};

/**
 * Pill-style button for the composer action row.
 * If children are provided (e.g. ComposerAddAttachment, DictateButton),
 * they are rendered inside the pill as the interactive trigger.
 * Otherwise the pill itself is a static label.
 */
const ComposerPillButton: FC<{
    icon: React.ReactNode;
    label: string;
    children?: React.ReactNode;
}> = ({ icon, label, children }) => {
    if (children) {
        return (
            <div className="aui-composer-pill flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-[color,background-color] hover:bg-secondary hover:text-foreground">
                {icon}
                <span className="font-medium">{label}</span>
                <div className="sr-only">{children}</div>
            </div>
        );
    }
    return (
        <div className="aui-composer-pill flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-[color,background-color] hover:bg-secondary hover:text-foreground">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
    );
};
