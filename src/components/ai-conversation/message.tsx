import {
    ActionBarPrimitive,
    BranchPickerPrimitive,
    ComposerPrimitive,
    ErrorPrimitive,
    MessagePrimitive,
} from '@assistant-ui/react';
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    PencilIcon,
    RefreshCwIcon,
} from 'lucide-react';
import type { FC } from 'react';

import { MarkdownText } from '@/components/ai-conversation/markdown-text';
import { ToolFallback } from '@/components/ai-conversation/tool-fallback';
import { TooltipIconButton } from '@/components/ai-conversation/tooltip-icon-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UserMessageAttachments } from './attachment';

export const AssistantMessage: FC = () => {
    return (
        <MessagePrimitive.Root asChild>
            <div
                className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] animate-in py-4 duration-200 fade-in slide-in-from-bottom-1 last:mb-28"
                data-role="assistant"
            >
                <div className="aui-assistant-message-content card-elevated mx-1 rounded-xl px-5 py-4 leading-7 break-words text-foreground md:mx-2">
                    <MessagePrimitive.Parts
                        components={{
                            Text: MarkdownText,
                            tools: { Fallback: ToolFallback },
                        }}
                    />
                    <MessageError />
                </div>

                <div className="aui-assistant-message-footer mt-2 ml-3 flex">
                    <BranchPicker />
                    <AssistantActionBar />
                </div>
            </div>
        </MessagePrimitive.Root>
    );
};

const MessageError: FC = () => {
    return (
        <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
                <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
            </ErrorPrimitive.Root>
        </MessagePrimitive.Error>
    );
};

const AssistantActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            autohideFloat="single-branch"
            className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
        >
            <ActionBarPrimitive.Copy asChild>
                <TooltipIconButton tooltip="Copy">
                    <MessagePrimitive.If copied>
                        <CheckIcon />
                    </MessagePrimitive.If>
                    <MessagePrimitive.If copied={false}>
                        <CopyIcon />
                    </MessagePrimitive.If>
                </TooltipIconButton>
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload asChild>
                <TooltipIconButton tooltip="Refresh">
                    <RefreshCwIcon />
                </TooltipIconButton>
            </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
    );
};

export const UserMessage: FC = () => {
    return (
        <MessagePrimitive.Root asChild>
            <div
                className="aui-user-message-root mx-auto grid w-full max-w-[var(--thread-max-width)] animate-in auto-rows-auto grid-cols-[minmax(48px,1fr)_auto] gap-y-2 px-1 py-4 duration-200 fade-in slide-in-from-bottom-1 first:mt-3 last:mb-6 md:grid-cols-[minmax(72px,1fr)_auto] md:px-2 [&:where(>*)]:col-start-2"
                data-role="user"
            >
                <UserMessageAttachments />

                <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
                    <div className="aui-user-message-content rounded-2xl bg-primary px-5 py-3 break-words text-primary-foreground shadow-sm">
                        <MessagePrimitive.Parts />
                    </div>
                    <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
                        <UserActionBar />
                    </div>
                </div>

                <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
            </div>
        </MessagePrimitive.Root>
    );
};

const UserActionBar: FC = () => {
    return (
        <ActionBarPrimitive.Root
            hideWhenRunning
            autohide="not-last"
            className="aui-user-action-bar-root flex flex-col items-end"
        >
            <ActionBarPrimitive.Edit asChild>
                <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
                    <PencilIcon />
                </TooltipIconButton>
            </ActionBarPrimitive.Edit>
        </ActionBarPrimitive.Root>
    );
};

export const EditComposer: FC = () => {
    return (
        <div className="aui-edit-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-2 first:mt-4">
            <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col rounded-xl border border-border/60 bg-background shadow-sm">
                <ComposerPrimitive.Input
                    className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
                    autoFocus
                />

                <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
                    <ComposerPrimitive.Cancel asChild>
                        <Button variant="ghost" size="sm" aria-label="Cancel edit">
                            Cancel
                        </Button>
                    </ComposerPrimitive.Cancel>
                    <ComposerPrimitive.Send asChild>
                        <Button size="sm" aria-label="Update message">
                            Update
                        </Button>
                    </ComposerPrimitive.Send>
                </div>
            </ComposerPrimitive.Root>
        </div>
    );
};

export const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
    return (
        <BranchPickerPrimitive.Root
            hideWhenSingleBranch
            className={cn(
                'aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground',
                className,
            )}
            {...rest}
        >
            <BranchPickerPrimitive.Previous asChild>
                <TooltipIconButton tooltip="Previous">
                    <ChevronLeftIcon />
                </TooltipIconButton>
            </BranchPickerPrimitive.Previous>
            <span className="aui-branch-picker-state font-medium">
                <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
            </span>
            <BranchPickerPrimitive.Next asChild>
                <TooltipIconButton tooltip="Next">
                    <ChevronRightIcon />
                </TooltipIconButton>
            </BranchPickerPrimitive.Next>
        </BranchPickerPrimitive.Root>
    );
};
