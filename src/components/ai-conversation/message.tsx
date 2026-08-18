'use client';

import { useState, type FC } from 'react';
import {
    CheckIcon,
    ChevronDownIcon,
    CopyIcon,
    Loader2Icon,
    PencilIcon,
    RefreshCwIcon,
} from 'lucide-react';

import type { CoachingMessage } from '@/components/ai-coach/use-conversation-messages';
import { useChatComposer, useChatThread } from '@/components/ai-conversation/chat-context';
import { MarkdownText } from '@/components/ai-conversation/markdown-text';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { ProposalCard } from '@/components/ai-coach/proposal-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserMessageAttachments } from './attachment';

interface AssistantMessageProps {
    message: CoachingMessage;
    isLast: boolean;
}

export const AssistantMessage: FC<AssistantMessageProps> = ({ message, isLast }) => {
    const { thinkingMessage } = useChatThread();
    const isThinking = message.status === 'running' && !message.content && !message.reasoning;

    return (
        <div
            className={cn(
                'aui-assistant-message-root group relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-200 fade-in slide-in-from-bottom-1',
                isLast && 'last:mb-28',
            )}
            data-role="assistant"
        >
            <div className="aui-assistant-message-content card-elevated mx-1 rounded-xl px-5 py-4 text-sm leading-6 break-words text-foreground md:mx-2">
                {message.reasoning && <ReasoningSection reasoning={message.reasoning} />}
                {message.content ? (
                    <MarkdownText text={message.content} />
                ) : (
                    isThinking && (
                        <div
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                            aria-live="polite"
                        >
                            <Loader2Icon className="size-4 animate-spin" />
                            <span>{thinkingMessage || 'Thinking…'}</span>
                        </div>
                    )
                )}
                {message.error && <MessageError message={message.error} />}
            </div>

            {message.proposals && message.proposals.length > 0 && (
                <div className="mt-2 mx-1 flex flex-col gap-2 md:mx-2">
                    {message.proposals.map(proposal => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                </div>
            )}

            {message.status !== 'running' && (
                <div
                    className={cn(
                        'aui-assistant-message-footer mt-2 ml-3 flex opacity-0 transition-opacity group-hover:opacity-100',
                        isLast && 'opacity-100',
                    )}
                >
                    <AssistantActionBar messageId={message.id} content={message.content} />
                </div>
            )}
        </div>
    );
};

const ReasoningSection: FC<{ reasoning: string }> = ({ reasoning }) => {
    return (
        <details className="aui-reasoning-root group/reasoning mb-3 rounded-lg border border-border/40 bg-muted/30">
            <summary className="aui-reasoning-trigger flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                <ChevronDownIcon className="aui-reasoning-chevron size-3.5 shrink-0 -rotate-90 transition-transform group-open/reasoning:rotate-0" />
                <span>Thinking</span>
            </summary>
            <div className="aui-reasoning-content whitespace-pre-wrap px-3 pb-3 text-xs leading-relaxed text-muted-foreground">
                {reasoning}
            </div>
        </details>
    );
};

const MessageError: FC<{ message: string }> = ({ message }) => {
    return (
        <div className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
            <p className="aui-message-error-message">{message}</p>
        </div>
    );
};

const AssistantActionBar: FC<{ messageId: string; content: string }> = ({
    messageId,
    content,
}) => {
    const { retry } = useChatThread();
    const [copied, setCopied] = useState(false);

    const copyMessage = async () => {
        if (!content || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access can be denied by the browser; keep the action quiet.
        }
    };

    return (
        <div className="aui-assistant-action-bar-root flex gap-1 text-muted-foreground">
            <TooltipIconButton tooltip="Copy" onClick={() => void copyMessage()}>
                {copied ? <CheckIcon /> : <CopyIcon />}
            </TooltipIconButton>
            <TooltipIconButton tooltip="Refresh" onClick={() => void retry(messageId)}>
                <RefreshCwIcon />
            </TooltipIconButton>
        </div>
    );
};

interface UserMessageProps {
    message: CoachingMessage;
}

export const UserMessage: FC<UserMessageProps> = ({ message }) => {
    const { editingMessageId } = useChatComposer();

    if (editingMessageId === message.id) {
        return <EditComposer />;
    }

    return (
        <div
            className="aui-user-message-root group mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(48px,1fr)_auto] gap-y-2 px-1 py-4 duration-200 fade-in slide-in-from-bottom-1 first:mt-3 last:mb-6 md:grid-cols-[minmax(72px,1fr)_auto] md:px-2 [&:where(>*)]:col-start-2"
            data-role="user"
        >
            <UserMessageAttachments attachments={message.attachments} />

            <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
                <div className="aui-user-message-content whitespace-pre-wrap rounded-2xl bg-primary px-5 py-3 text-sm leading-6 break-words text-primary-foreground shadow-sm">
                    {message.content}
                </div>
                <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <UserActionBar message={message} />
                </div>
            </div>
        </div>
    );
};

const UserActionBar: FC<{ message: CoachingMessage }> = ({ message }) => {
    const { startEditing } = useChatComposer();
    const { isRunning } = useChatThread();

    return (
        <TooltipIconButton
            tooltip="Edit"
            onClick={() => startEditing(message)}
            disabled={isRunning}
            className="aui-user-action-edit p-4"
        >
            <PencilIcon />
        </TooltipIconButton>
    );
};

export const EditComposer: FC = () => {
    const { editText, setEditText, cancelEditing, updateEditing } = useChatComposer();
    const { isRunning } = useChatThread();

    return (
        <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
            <div className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col rounded-xl border border-border/60 bg-background shadow-sm">
                <textarea
                    value={editText}
                    onChange={event => setEditText(event.target.value)}
                    className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
                    autoFocus
                    rows={3}
                    aria-label="Edit message"
                />
                <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                        aria-label="Cancel edit"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => void updateEditing()}
                        disabled={isRunning || !editText.trim()}
                        aria-label="Update message"
                    >
                        Update
                    </Button>
                </div>
            </div>
        </div>
    );
};
