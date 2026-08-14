'use client';

import { useEffect, useRef, type FC, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowDownIcon, ArrowUpIcon, Square } from 'lucide-react';

import { useChatComposer, useChatThread } from '@/components/ai-conversation/chat-context';
import { ComposerAttachments } from '@/components/ai-conversation/attachment';
import { ComposerAttachMenu } from '@/components/ai-conversation/composer-attach-menu';
import { DictateButton } from '@/components/ai-conversation/dictate-button';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { Button } from '@/components/ui/button';
import { ThreadWelcomeSuggestions } from './thread-welcome';

interface ComposerProps {
    showScrollToBottom: boolean;
    onScrollToBottom: () => void;
}

export const Composer: FC<ComposerProps> = ({ showScrollToBottom, onScrollToBottom }) => {
    const { text, setText, send, cancel, attachments } = useChatComposer();
    const { isEmpty, isRunning } = useChatThread();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;
        input.style.height = '0px';
        input.style.height = `${Math.min(input.scrollHeight, 144)}px`;
    }, [text]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void send();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== 'Enter' || event.shiftKey || isRunning) return;
        event.preventDefault();
        void send();
    };

    return (
        <div className="aui-composer-wrapper sticky bottom-0 z-10 mx-auto flex w-full max-w-[var(--thread-max-width)] shrink-0 flex-col gap-3 overflow-visible bg-gradient-to-t from-card via-card/95 to-transparent px-8 pb-[26px] pt-6">
            {showScrollToBottom && (
                <TooltipIconButton
                    tooltip="Scroll to bottom"
                    variant="outline"
                    onClick={onScrollToBottom}
                    className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-lg border-border bg-background p-4 shadow-sm dark:hover:bg-accent"
                >
                    <ArrowDownIcon />
                </TooltipIconButton>
            )}
            {isEmpty && <ThreadWelcomeSuggestions />}
            <form
                onSubmit={handleSubmit}
                className="aui-composer-root relative flex w-full flex-col rounded-xl border border-border bg-card px-4 pt-3 shadow-sm transition-[border-color,background-color] focus-within:border-foreground/20"
            >
                <ComposerAttachments />
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={event => setText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell your coach what got in the way…"
                    className="aui-composer-input mb-1 max-h-36 min-h-16 w-full resize-none overflow-y-auto bg-transparent px-0 pt-0.5 pb-3 text-base leading-6 outline-none placeholder:text-muted-foreground/60 focus:outline-none md:text-sm"
                    rows={1}
                    autoFocus
                    aria-label="Message input"
                />
                <div className="aui-composer-action-wrapper relative mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <ComposerAttachMenu />
                        <DictateButton />
                    </div>

                    {isRunning ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={cancel}
                            className="aui-composer-cancel size-8 rounded-lg border-border bg-background hover:bg-muted"
                            aria-label="Stop generating"
                        >
                            <Square className="aui-composer-cancel-icon size-3 fill-foreground" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!text.trim() && attachments.length === 0}
                            className="aui-composer-send size-8 rounded-lg bg-secondary p-1 text-secondary-foreground hover:bg-secondary/85"
                            aria-label="Send message"
                        >
                            <ArrowUpIcon className="aui-composer-send-icon size-4" />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
