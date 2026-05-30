"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Habit, CheckIn } from "@/api";

export type CheckInBannerProps = {
  habits: Habit[];
  todayCheckIns?: CheckIn[];
  onCheckInAll: () => void;
};

export function CheckInBanner({ habits, todayCheckIns = [], onCheckInAll }: CheckInBannerProps) {
  const { checkedCount, remainingCount, allChecked } = useMemo(() => {
    const checkedHabitIds = new Set(todayCheckIns.map((ci) => ci.habitId));
    const checkedCount = habits.filter((h) => checkedHabitIds.has(h.id)).length;
    const remainingCount = habits.length - checkedCount;
    return { checkedCount, remainingCount, allChecked: remainingCount === 0 && habits.length > 0 };
  }, [habits, todayCheckIns]);

  if (habits.length === 0) {
    return (
      <div className="card-elevated rounded-lg p-4 text-sm text-muted-foreground">
        No habits yet. Create one to start checking in daily.
      </div>
    );
  }

  return (
    <div className={cn(
      "card-elevated rounded-xl p-4 transition-all duration-300",
      allChecked && "bg-growth/5 border-growth/20"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {allChecked ? (
            <CheckCircle2 className="h-5 w-5 text-growth" />
          ) : (
            <CircleDashed className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className={cn(
              "text-sm font-medium",
              allChecked ? "text-growth" : "text-foreground"
            )}>
              {allChecked
                ? "All habits checked in today!"
                : `${remainingCount} habit${remainingCount === 1 ? "" : "s"} left to check in`}
            </p>
            <p className="text-xs text-muted-foreground">
              {checkedCount}/{habits.length} completed
            </p>
          </div>
        </div>
        {!allChecked && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {checkedCount}/{habits.length}
            </Badge>
            <Button variant="growth" size="sm" onClick={onCheckInAll}>
              Check In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
