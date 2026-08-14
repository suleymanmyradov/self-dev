'use client';

import { useCallback, type FC } from 'react';
import { useComposerRuntime } from '@assistant-ui/react';
import {
    PaperclipIcon,
    TargetIcon,
    TrophyIcon,
    ChevronRightIcon,
    FileIcon,
} from 'lucide-react';

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
import { cn } from '@/lib/utils';

/**
 * Attach menu for the composer. A single pill-style dropdown button that
 * replaces the old separate "Attach" and "Reference a habit" pills. Provides:
 *
 * - Attach file (opens the OS file picker, respects attachmentAccept)
 * - Reference goal (submenu listing the user's goals)
 * - Reference habit (submenu listing the user's habits)
 *
 * When a goal or habit is selected, a textual reference like
 * `[Goal: "Read 10 books"]` is appended to the composer input so the coaching
 * model knows which entity the user is asking about.
 */
export const ComposerAttachMenu: FC = () => {
    const composer = useComposerRuntime();
    const { data: goals } = useGoals();
    const { data: habits } = useHabits();

    const insertReference = useCallback(
        (label: string, title: string) => {
            const current = composer.getState().text;
            const ref = `[${label}: "${title}"]`;
            const prefix = current && !/\s$/.test(current) ? ' ' : '';
            composer.setText(current + prefix + ref);
        },
        [composer],
    );

    const handleAttachFile = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.hidden = true;
        const accept = composer.getState().attachmentAccept;
        if (accept !== '*') input.accept = accept;
        document.body.appendChild(input);
        input.onchange = async e => {
            const fileList = (e.target as HTMLInputElement).files;
            if (!fileList) return;
            for (const file of fileList) {
                await composer.addAttachment(file);
            }
            document.body.removeChild(input);
        };
        input.oncancel = () => {
            if (!input.files || input.files.length === 0) {
                document.body.removeChild(input);
            }
        };
        input.click();
    }, [composer]);

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
