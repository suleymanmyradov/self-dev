"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity as ActivityIcon } from "lucide-react";
import { useActivities } from "@/hooks/use-activities";
import { ActivityItem, ActivityEmptyState, ActivityFilterBar } from "@/components/activity";
import type { ActivityType, ActivityResponse } from "@/api";
import { useSearchParamState } from "@/lib/url-state";

type FilterValue = ActivityType | "all" | "check_in";

interface ActivityClientProps {
  initialActivities?: ActivityResponse;
}

export function ActivityClient({ initialActivities }: ActivityClientProps) {
  const [filter, setFilter] = useSearchParamState("filter", "all") as [FilterValue, (v: string) => void];
  const { data: activities, isLoading, isError, error, refetch, isRefetching } = useActivities(undefined, initialActivities);

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (filter === "all") return activities;
    if (filter === "check_in")
      return activities.filter(a => a.type === "check_in_completed" || a.type === "check_in_missed");
    return activities.filter(a => a.type === filter);
  }, [activities, filter]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your activity</h1>
              <p className="text-sm text-muted-foreground">A timeline of your recent actions.</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </header>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent</CardTitle>
                <ActivityFilterBar filter={filter} onFilterChange={setFilter as (f: FilterValue) => void} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4 py-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ActivityIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">{error?.message ?? "Failed to load activities"}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              ) : !filteredActivities?.length ? (
                <ActivityEmptyState filter={filter} />
              ) : (
                <ul className="divide-y">
                  {filteredActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </ul>
              )}
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">More detailed analytics coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
