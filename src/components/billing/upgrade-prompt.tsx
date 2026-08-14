"use client";

import { memo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useTrackUpgradeEvent } from "@/hooks";
import { cn } from "@/lib/utils";
import type { UpgradeTrigger, UpgradeSurface } from "@/api";

interface UpgradePromptProps {
  surface: UpgradeSurface;
  trigger: UpgradeTrigger;
  title: string;
  description: string;
  compact?: boolean;
  isPro?: boolean;
  onDismiss?: () => void;
  onArchive?: () => void;
}

const TRIGGER_MESSAGES: Record<UpgradeTrigger, { title: string; description: string }> = {
  goal_limit: {
    title: "That's your third goal.",
    description: "Free includes 3 active goals. Archive one, or upgrade to Pro for unlimited goals.",
  },
  habit_limit: {
    title: "That's your fifth habit.",
    description: "Free includes 5 active habits. Upgrade to Pro for unlimited habits.",
  },
  weekly_history: {
    title: "Unlock your full history",
    description: "You've built enough consistency to benefit from a fuller weekly history. Pro unlocks all past reviews.",
  },
  personalized_ai: {
    title: "Unlock deeper coaching memory",
    description: "Get personalized AI coaching that remembers your patterns and adapts to your goals.",
  },
  plan_adjustments: {
    title: "Unlock advanced plan adjustments",
    description: "You've used your pending suggestion limit. Pro gives you unlimited plan adjustments.",
  },
};

export const UpgradePrompt = memo(function UpgradePrompt({
  surface,
  trigger,
  title: titleProp,
  description: descProp,
  compact = false,
  isPro = false,
  onDismiss,
  onArchive,
}: UpgradePromptProps) {
  const trackEvent = useTrackUpgradeEvent();
  const hasTrackedView = useRef(false);

  const title = titleProp || TRIGGER_MESSAGES[trigger]?.title || "Upgrade to Pro";
  const description = descProp || TRIGGER_MESSAGES[trigger]?.description || "Unlock more features with Growth Pro.";

  // Track prompt_viewed once per mount
  useEffect(() => {
    if (!hasTrackedView.current && !isPro) {
      hasTrackedView.current = true;
      trackEvent.mutate({
        eventType: "prompt_viewed",
        surface,
        trigger,
        planCode: "pro",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(() => {
    trackEvent.mutate({
      eventType: "prompt_clicked",
      surface,
      trigger,
      planCode: "pro",
    });
    window.location.href = "/me";
  }, [trackEvent, surface, trigger]);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  // Don't show to Pro users
  if (isPro) return null;

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-card p-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm truncate font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={handleClick}>
            See Pro
          </Button>
          {onDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss upgrade prompt"
              className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // In-context limit prompt: dashed border card
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-card p-5")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss upgrade prompt"
            className="text-muted-foreground hover:text-foreground shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={handleClick}>
          See Pro
        </Button>
        {trigger === "goal_limit" && onArchive && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Archive a goal
          </Button>
        )}
        {trigger === "habit_limit" && onArchive && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Archive a habit
          </Button>
        )}
      </div>
    </div>
  );
});
