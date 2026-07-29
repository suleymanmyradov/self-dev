"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3, Target, Calendar, RotateCcw, Sparkles } from "lucide-react";

type WeeklyReviewEmptyStateVariant = 'no_habits' | 'no_check_ins' | 'partial_week' | 'no_review';

interface WeeklyReviewEmptyStateProps {
  variant: WeeklyReviewEmptyStateVariant;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const variantConfig = {
  no_habits: {
    icon: Target,
    title: "No habits yet",
    description: "Create your first habit to unlock weekly reviews.",
    actionLabel: "Create Habit",
    actionHref: "/plan",
  },
  no_check_ins: {
    icon: Target,
    title: "No check-ins this week",
    description: "Complete a daily check-in to generate your first weekly review.",
    actionLabel: "Go to Habits",
    actionHref: "/plan",
  },
  partial_week: {
    icon: Calendar,
    title: "Week in progress",
    description: "This week is still in progress. Your review will become more useful after a few check-ins.",
    actionLabel: "Generate In-Progress Review",
    actionHref: null,
  },
  no_review: {
    icon: BarChart3,
    title: "No weekly review yet",
    description: "Generate your first weekly review to see insights about your habits, patterns, and progress.",
    actionLabel: "Generate Weekly Review",
    actionHref: null,
  },
};

export function WeeklyReviewEmptyState({ variant, onGenerate, isGenerating }: WeeklyReviewEmptyStateProps) {
  const router = useRouter();
  const config = variantConfig[variant];

  const handleAction = () => {
    if (config.actionHref) {
      router.push(config.actionHref);
    } else if (onGenerate) {
      onGenerate();
    }
  };

  const action = (
    <Button onClick={handleAction} disabled={isGenerating}>
      {isGenerating ? (
        <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {config.actionLabel}
    </Button>
  );

  return (
    <EmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={action}
    />
  );
}
