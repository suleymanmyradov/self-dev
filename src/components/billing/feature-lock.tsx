"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBillingOverview } from "@/hooks";

interface FeatureLockProps {
  feature: "weekly_review_history" | "personalized_ai" | "plan_adjustments";
  children?: React.ReactNode;
  className?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  weekly_review_history: "Full weekly review history",
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

  return (
    <div className={cn("relative", className)}>
      {/* Blurred/locked content behind overlay */}
      {children && (
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/60 backdrop-blur-sm">
        <div className="rounded-full bg-energy/15 p-2">
          <Lock className="h-4 w-4 text-energy" />
        </div>
        <p className="text-sm font-medium">{FEATURE_LABELS[feature] ?? "This feature"}</p>
        <a
          href="/pricing"
          className="text-xs text-energy hover:underline"
        >
          Unlock with Pro
        </a>
      </div>
    </div>
  );
}
