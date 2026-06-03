"use client";

import { use, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity as ActivityIcon } from "lucide-react";
import { useActivities } from "@/hooks";
import { ActivityItem, ActivityEmptyState, ActivityFilterBar } from "@/components/activity";
import type { ActivityType, ActivityResponse } from "@/api";
import { useSearchParamState } from "@/lib/url-state";

type FilterValue = ActivityType | "all" | "check_in";

interface ActivityClientProps {
  activitiesPromise: Promise<ActivityResponse>;
}

export function ActivityClient({ activitiesPromise }: ActivityClientProps) {
  const initialData = use(activitiesPromise);
  const { data: activities = [], isFetching, error: queryError, refetch } = useActivities({ page: 1, limit: 50 }, initialData);

  const [filter, setFilter] = useSearchParamState("filter", "all") as [FilterValue, (v: string) => void];

  const handleRefetch = () => refetch();

  const filteredActivities = useMemo(() => {
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
              aria-label="Refresh activity"
              onClick={handleRefetch}
              disabled={isFetching}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
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
              {queryError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ActivityIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">{queryError instanceof Error ? queryError.message : "Failed to refresh"}</p>
                  <Button variant="outline" size="sm" onClick={handleRefetch}>
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
