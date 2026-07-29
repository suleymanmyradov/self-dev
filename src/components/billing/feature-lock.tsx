"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBillingOverview } from "@/hooks";

interface FeatureLockProps {
  feature: "weekly_review_history" | "personalized_ai" | "plan_adjustments";
  children?: React.ReactNode;
  className?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  weekly_review_history: "Six-month pattern analysis",
  personalized_ai: "Personalized AI coaching",
  plan_adjustments: "Advanced plan adjustments",
};

export function FeatureLock({ feature, children, className }: FeatureLockProps) {
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";

  // Pro users see the content normally
  if (isPro) {
    return children ? <>{children}</> : null;
  }

  // Non-Pro: show greyed real data (not blurred) with a "Show me what it would say" link
  return (
    <div className={cn("relative rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Greyed content — real data, not blurred */}
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay with unlock prompt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80">
        <p className="text-sm font-medium">{FEATURE_LABELS[feature] ?? "This feature"}</p>
        <Link
          href="/me"
          className="text-sm text-success hover:underline underline-offset-4"
        >
          Show me what it would say
        </Link>
      </div>
    </div>
  );
}
