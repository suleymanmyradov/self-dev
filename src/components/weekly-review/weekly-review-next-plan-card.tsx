import { AlertTriangle, ArrowRight, CheckCircle2, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReviewNextWeekPlan } from "@/api";

function PlanList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: 'commitment' | 'risk' | 'recovery';
}) {
  if (items.length === 0) return null;

  const Icon = icon === 'commitment' ? CheckCircle2 : icon === 'risk' ? AlertTriangle : ArrowRight;
  const iconClass = icon === 'commitment' ? 'text-success' : icon === 'risk' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-2.5">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-relaxed">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NextPlanCard({ plan }: { plan: WeeklyReviewNextWeekPlan }) {
  const hasPlan = Boolean(
    plan?.focus || plan?.commitments?.length || plan?.risks?.length || plan?.recoveryActions?.length,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your plan for next week</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasPlan ? (
          <p className="text-sm text-muted-foreground">No next-week plan generated.</p>
        ) : (
          <div className="space-y-5">
            {plan.focus && (
              <div className="rounded-lg bg-success/10 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-success">
                  <Target className="h-4 w-4" />
                  Main focus
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed">{plan.focus}</p>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <PlanList title="Commitments" items={plan.commitments ?? []} icon="commitment" />
              <PlanList title="Risks to watch" items={plan.risks ?? []} icon="risk" />
            </div>
            <PlanList title="If you get off track" items={plan.recoveryActions ?? []} icon="recovery" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
