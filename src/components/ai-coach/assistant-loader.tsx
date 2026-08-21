'use client';

import dynamic from 'next/dynamic';

const Assistant = dynamic(
    () => import('@/components/ai-coach/assistant').then(mod => mod.Assistant),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/60 bg-background px-4 py-2 shadow-sm">
                    Loading coach...
                </div>
            </div>
        ),
    },
);

export function AssistantLoader({
    initialGoalId,
    initialGoalTitle,
}: {
    initialGoalId?: string;
    initialGoalTitle?: string;
}) {
    return <Assistant initialGoalId={initialGoalId} initialGoalTitle={initialGoalTitle} />;
}
