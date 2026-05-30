"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity as ActivityIcon } from "lucide-react";
import { useActivities } from "@/hooks/use-activities";
import { ActivityItem, ActivityEmptyState, ActivityFilterBar } from "@/components/activity";
import type { ActivityType } from "@/api";

export function ActivityClient() {
  const [filter, setFilter] = useState<ActivityType | 'all' | 'check_in'>('all');
  const { data: activities, isLoading, isError, error, refetch, isRefetching } = useActivities();

  const filteredActivities = filter === 'all'
    ? activities || []
    : filter === 'check_in'
      ? (activities || []).filter(a => a.type === 'check_in_completed' || a.type === 'check_in_missed')
      : (activities || []).filter(a => a.type === filter);

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
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </header>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent</CardTitle>
                <ActivityFilterBar filter={filter} onFilterChange={setFilter} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ActivityIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">{error?.message ?? 'Failed to load activities'}</p>
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
