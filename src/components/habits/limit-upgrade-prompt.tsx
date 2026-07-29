"use client";

import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

interface LimitUpgradePromptProps {
  open: boolean;
  surface: string;
  trigger: string;
  isPro: boolean;
  onDismiss: () => void;
}

export function LimitUpgradePrompt({ open, surface, trigger, isPro, onDismiss }: LimitUpgradePromptProps) {
  return (
    <>
      {/* Habit limit upgrade prompt */}
      {open && surface === "habit_create_limit" && (
        <div className="mt-4">
          <UpgradePrompt
            surface={surface as "habit_create_limit"}
            trigger={trigger as "habit_limit"}
            title="Unlock unlimited habits"
            description="You've reached the Free plan habit limit. Upgrade to Pro to build more daily habits."
            isPro={isPro}
            onDismiss={onDismiss}
          />
        </div>
      )}

      {/* Goal limit upgrade prompt */}
      {open && surface === "goal_create_limit" && (
        <div className="mt-4">
          <UpgradePrompt
            surface={surface as "goal_create_limit"}
            trigger={trigger as "goal_limit"}
            title="Unlock unlimited goals"
            description="You've reached the Free plan goal limit. Upgrade to Pro to track as many goals as you need."
            isPro={isPro}
            onDismiss={onDismiss}
          />
        </div>
      )}
    </>
  );
}
