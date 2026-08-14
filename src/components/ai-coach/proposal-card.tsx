'use client';

import { useState, type FC } from 'react';
import { CheckIcon, Loader2Icon, XIcon, AlertCircleIcon } from 'lucide-react';

import type { CoachingProposal, ProposalAction } from '@/api/personalization';
import {
    useCreateGoal,
    useUpdateGoal,
    useDeleteGoal,
    useCreateHabit,
    useUpdateHabit,
    useDeleteHabit,
} from '@/hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProposalCardProps {
    proposal: CoachingProposal;
}

const actionLabels: Record<ProposalAction, string> = {
    create_goal: 'Create Goal',
    update_goal: 'Update Goal',
    delete_goal: 'Delete Goal',
    create_habit: 'Create Habit',
    update_habit: 'Update Habit',
    delete_habit: 'Delete Habit',
};

const actionIcons: Record<ProposalAction, string> = {
    create_goal: '+',
    update_goal: '~',
    delete_goal: '-',
    create_habit: '+',
    update_habit: '~',
    delete_habit: '-',
};

type CardStatus = 'pending' | 'applying' | 'applied' | 'error';

/**
 * Renders a single agent proposal as an inline confirm/cancel card inside
 * the coaching conversation. On confirm, calls the existing CRUD mutation
 * hook (which invalidates React Query caches). On cancel, dismisses the card.
 */
export const ProposalCard: FC<ProposalCardProps> = ({ proposal }) => {
    const [status, setStatus] = useState<CardStatus>('pending');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const createGoal = useCreateGoal();
    const updateGoal = useUpdateGoal();
    const deleteGoal = useDeleteGoal();
    const createHabit = useCreateHabit();
    const updateHabit = useUpdateHabit();
    const deleteHabit = useDeleteHabit();

    const label = actionLabels[proposal.action] ?? proposal.action;
    const icon = actionIcons[proposal.action] ?? '?';

    const handleConfirm = () => {
        setStatus('applying');
        setErrorMsg(null);

        const p = proposal.payload;
        let promise: Promise<unknown>;

        switch (proposal.action) {
            case 'create_goal':
                promise = new Promise((resolve, reject) => {
                    createGoal.mutate(
                        {
                            title: String(p.title ?? ''),
                            description: String(p.description ?? ''),
                            category: String(p.category ?? ''),
                            dueDate: p.dueDate ? String(p.dueDate) : undefined,
                            relatedHabitIds: Array.isArray(p.relatedHabitIds)
                                ? (p.relatedHabitIds as string[])
                                : undefined,
                        },
                        { onSuccess: resolve, onError: reject },
                    );
                });
                break;
            case 'update_goal':
                promise = new Promise((resolve, reject) => {
                    updateGoal.mutate(
                        {
                            id: String(p.goalId ?? ''),
                            data: {
                                title: p.title ? String(p.title) : undefined,
                                description: p.description ? String(p.description) : undefined,
                                category: p.category ? String(p.category) : undefined,
                                dueDate: p.dueDate ? String(p.dueDate) : undefined,
                                relatedHabitIds: Array.isArray(p.relatedHabitIds)
                                    ? (p.relatedHabitIds as string[])
                                    : undefined,
                            },
                        },
                        { onSuccess: resolve, onError: reject },
                    );
                });
                break;
            case 'delete_goal':
                promise = new Promise((resolve, reject) => {
                    deleteGoal.mutate(String(p.goalId ?? ''), {
                        onSuccess: resolve,
                        onError: reject,
                    });
                });
                break;
            case 'create_habit':
                promise = new Promise((resolve, reject) => {
                    createHabit.mutate(
                        {
                            name: String(p.name ?? ''),
                            description: String(p.description ?? ''),
                            category: String(p.category ?? ''),
                        },
                        { onSuccess: resolve, onError: reject },
                    );
                });
                break;
            case 'update_habit':
                promise = new Promise((resolve, reject) => {
                    updateHabit.mutate(
                        {
                            id: String(p.habitId ?? ''),
                            data: {
                                name: p.name ? String(p.name) : undefined,
                                description: p.description ? String(p.description) : undefined,
                                category: p.category ? String(p.category) : undefined,
                            },
                        },
                        { onSuccess: resolve, onError: reject },
                    );
                });
                break;
            case 'delete_habit':
                promise = new Promise((resolve, reject) => {
                    deleteHabit.mutate(String(p.habitId ?? ''), {
                        onSuccess: resolve,
                        onError: reject,
                    });
                });
                break;
            default:
                setStatus('error');
                setErrorMsg(`Unknown action: ${proposal.action}`);
                return;
        }

        promise
            .then(() => setStatus('applied'))
            .catch((err: unknown) => {
                setStatus('error');
                setErrorMsg(err instanceof Error ? err.message : 'Failed to apply');
            });
    };

    const handleCancel = () => {
        setStatus('pending');
        setErrorMsg(null);
    };

    if (status === 'applied') {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-400">
                <CheckIcon className="size-3.5 shrink-0" />
                <span>{label} applied</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-lg border px-3 py-2.5 text-xs',
                status === 'error'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-border bg-muted/40',
            )}
        >
            <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
                <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/15 text-[10px] font-bold text-primary">
                    {icon}
                </span>
                <span>{label}</span>
            </div>

            <ProposalSummary action={proposal.action} payload={proposal.payload} />

            {status === 'error' && errorMsg && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600 dark:text-red-400">
                    <AlertCircleIcon className="size-3 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {status !== 'applying' && (
                <div className="mt-2.5 flex gap-2">
                    <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleConfirm}
                    >
                        <CheckIcon className="size-3" />
                        Confirm
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-3 text-xs"
                        onClick={handleCancel}
                    >
                        <XIcon className="size-3" />
                        Cancel
                    </Button>
                </div>
            )}

            {status === 'applying' && (
                <div className="mt-2.5 flex items-center gap-2 text-muted-foreground">
                    <Loader2Icon className="size-3 animate-spin" />
                    <span>Applying...</span>
                </div>
            )}
        </div>
    );
};

/**
 * Renders a compact, human-readable summary of the proposal payload so the
 * user can see exactly what will change before confirming.
 */
const ProposalSummary: FC<{ action: ProposalAction; payload: Record<string, unknown> }> = ({
    action,
    payload,
}) => {
    const fields: string[] = [];

    const push = (label: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== '') {
            fields.push(`${label}: ${String(value)}`);
        }
    };

    switch (action) {
        case 'create_goal':
        case 'update_goal':
            push('Title', payload.title);
            push('Category', payload.category);
            push('Due', payload.dueDate);
            if (payload.description) push('Description', payload.description);
            break;
        case 'delete_goal':
            push('Goal ID', payload.goalId);
            break;
        case 'create_habit':
        case 'update_habit':
            push('Name', payload.name);
            push('Category', payload.category);
            if (payload.description) push('Description', payload.description);
            break;
        case 'delete_habit':
            push('Habit ID', payload.habitId);
            break;
    }

    if (fields.length === 0) return null;

    return (
        <div className="space-y-0.5 text-muted-foreground">
            {fields.map((f, i) => (
                <div key={i}>{f}</div>
            ))}
        </div>
    );
};
