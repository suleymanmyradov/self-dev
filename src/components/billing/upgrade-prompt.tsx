"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useTrackUpgradeEvent, useBillingOverview } from "@/hooks";
import { cn } from "@/lib/utils";
import type { UpgradeTrigger, UpgradeSurface } from "@/api";

interface UpgradePromptProps {
  surface: UpgradeSurface;
  trigger: UpgradeTrigger;
  title: string;
  description: string;
  compact?: boolean;
  onDismiss?: () => void;
}

const TRIGGER_MESSAGES: Record<UpgradeTrigger, { title: string; description: string }> = {
  goal_limit: {
    title: "Unlock unlimited goals",
    description: "You&apos;ve reached the Free plan goal limit. Upgrade to Pro to track as many goals as you need.",
  },
  habit_limit: {
    title: "Unlock unlimited habits",
    description: "You&apos;ve reached the Free plan habit limit. Upgrade to Pro to build more daily habits.",
  },
  weekly_history: {
    title: "Unlock your full history",
    description: "You&apos;ve built enough consistency to benefit from a fuller weekly history. Pro unlocks all past reviews.",
  },
  personalized_ai: {
    title: "Unlock deeper coaching memory",
    description: "Get personalized AI coaching that remembers your patterns and adapts to your goals.",
  },
  plan_adjustments: {
    title: "Unlock advanced plan adjustments",
    description: "You&apos;ve used your pending suggestion limit. Pro gives you unlimited plan adjustments.",
  },
};

const FEEDBACK_REASONS = [
  "Too expensive",
  "Not enough value yet",
  "I need more time",
  "Missing a feature I need",
  "I do not trust AI coaching enough",
  "Other",
];

export function UpgradePrompt({
  surface,
  trigger,
  title: titleProp,
  description: descProp,
  compact = false,
  onDismiss,
}: UpgradePromptProps) {
  const trackEvent = useTrackUpgradeEvent();
  const { data: billing } = useBillingOverview();
  const hasTrackedView = useRef(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState("");

  const isPro = billing?.subscription?.planCode === "pro";

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
    window.location.href = "/pricing";
  }, [trackEvent, surface, trigger]);

  const handleDismiss = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const handleSubmitFeedback = useCallback(() => {
    trackEvent.mutate({
      eventType: "prompt_dismissed",
      surface,
      trigger,
      planCode: "pro",
      feedbackReason: selectedReason || undefined,
      feedbackNote: feedbackNote || undefined,
    });
    setShowFeedback(false);
    onDismiss?.();
  }, [trackEvent, surface, trigger, selectedReason, feedbackNote, onDismiss]);

  const handleSkipFeedback = useCallback(() => {
    trackEvent.mutate({
      eventType: "prompt_dismissed",
      surface,
      trigger,
      planCode: "pro",
    });
    setShowFeedback(false);
    onDismiss?.();
  }, [trackEvent, surface, trigger, onDismiss]);

  // Don't show to Pro users
  if (isPro) return null;

  if (showFeedback) {
    return (
      <Card className="border-energy/20 bg-gradient-to-br from-energy/5 to-transparent">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-2">What would make Pro more valuable for you?</p>
          <div className="grid gap-1.5 mb-3">
            {FEEDBACK_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`text-left text-xs rounded-lg border px-2.5 py-1.5 transition-colors ${
                  selectedReason === reason
                    ? "border-energy bg-energy/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          {selectedReason === "Other" && (
            <input
              type="text"
              placeholder="Tell us more..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full text-sm rounded-lg border border-border px-3 py-2 mb-3 bg-background"
            />
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="energy" onClick={handleSubmitFeedback} disabled={!selectedReason}>
              Submit
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSkipFeedback}>
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-energy/20 bg-energy/5 p-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-energy shrink-0" />
          <span className="text-sm truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="energy" onClick={handleClick}>
            Upgrade
          </Button>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-energy/20 bg-gradient-to-br from-energy/5 to-transparent")}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-energy/15 p-1.5">
              <Sparkles className="h-4 w-4 text-energy" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="energy" onClick={handleClick}>
            Upgrade to Pro
          </Button>
          <span className="text-xs text-muted-foreground">
            Cancel anytime
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
