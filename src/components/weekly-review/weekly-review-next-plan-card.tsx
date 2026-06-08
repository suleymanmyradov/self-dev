'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import type { WeeklyReviewNextWeekPlan } from '@/api';

export function WeeklyReviewNextPlanCard({ plan }: { plan: WeeklyReviewNextWeekPlan }) {
    if (
        !plan ||
        (!plan.focus &&
            !plan.commitments?.length &&
            !plan.risks?.length &&
            !plan.recoveryActions?.length)
    ) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No next-week plan generated.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-growth" />
                    Next Week Plan
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {plan.focus && (
                    <div className="rounded-lg bg-growth-soft/20 p-4">
                        <div className="text-xs font-medium text-growth mb-1">Focus</div>
                        <div className="text-sm font-medium">{plan.focus}</div>
                    </div>
                )}
                {plan.commitments?.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">Commitments</div>
                        {plan.commitments.map(c => (
                            <div key={c} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-growth mt-0.5 shrink-0" />
                                <span>{c}</span>
                            </div>
                        ))}
                    </div>
                )}
                {plan.risks?.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">Risks</div>
                        {plan.risks.map(r => (
                            <div key={r} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-energy mt-0.5 shrink-0" />
                                <span>{r}</span>
                            </div>
                        ))}
                    </div>
                )}
                {plan.recoveryActions?.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                            Recovery Actions
                        </div>
                        {plan.recoveryActions.map(a => (
                            <div key={a} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="h-4 w-4 text-calm mt-0.5 shrink-0" />
                                <span>{a}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
