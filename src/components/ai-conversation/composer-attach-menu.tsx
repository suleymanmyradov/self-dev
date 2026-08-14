'use client';

import { useCallback, type FC } from 'react';
import { PaperclipIcon, TargetIcon, TrophyIcon, FileIcon } from 'lucide-react';

import { useChatComposer } from '@/components/ai-conversation/chat-context';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useGoals, useHabits } from '@/hooks';

/**
 * Attach menu for the composer. Provides file attachments and textual
 * references to the user's goals and habits.
 */
export const ComposerAttachMenu: FC = () => {
    const { text, setText, attachmentAccept, addAttachment } = useChatComposer();
    const { data: goals } = useGoals();
    const { data: habits } = useHabits();

    const insertReference = useCallback(
        (label: string, title: string) => {
            const reference = `[${label}: "${title}"]`;
            const prefix = text && !/\s$/.test(text) ? ' ' : '';
            setText(text + prefix + reference);
        },
        [setText, text],
    );

    const handleAttachFile = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.hidden = true;
        input.accept = attachmentAccept;
        document.body.appendChild(input);
        input.onchange = event => {
            const fileList = (event.target as HTMLInputElement).files;
            if (fileList) {
                Array.from(fileList).forEach(addAttachment);
            }
            input.remove();
        };
        input.oncancel = () => input.remove();
        input.click();
    }, [addAttachment, attachmentAccept]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="aui-composer-pill flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-[color,background-color] hover:bg-secondary hover:text-foreground"
                >
                    <PaperclipIcon className="size-3" />
                    <span className="font-medium">Attach</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem onClick={handleAttachFile}>
                    <FileIcon className="size-4" />
                    Attach file
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <TrophyIcon className="size-4" />
                        Reference goal
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {goals && goals.length > 0 ? (
                            goals.map(goal => (
                                <DropdownMenuItem
                                    key={goal.id}
                                    onClick={() => insertReference('Goal', goal.title)}
                                >
                                    <span className="line-clamp-1">{goal.title}</span>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuLabel className="text-muted-foreground">
                                No goals yet
                            </DropdownMenuLabel>
                        )}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <TargetIcon className="size-4" />
                        Reference habit
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {habits && habits.length > 0 ? (
                            habits.map(habit => (
                                <DropdownMenuItem
                                    key={habit.id}
                                    onClick={() => insertReference('Habit', habit.name)}
                                >
                                    <span className="line-clamp-1">{habit.name}</span>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuLabel className="text-muted-foreground">
                                No habits yet
                            </DropdownMenuLabel>
                        )}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
