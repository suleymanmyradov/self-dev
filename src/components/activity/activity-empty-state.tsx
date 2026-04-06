import { Plus } from "lucide-react";
import type { ActivityType } from "@/api";

interface ActivityEmptyStateProps {
  filter: ActivityType | 'all';
}

export function ActivityEmptyState({ filter }: ActivityEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Plus className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm font-medium mb-1">No activities yet</p>
      <p className="text-xs text-muted-foreground">
        {filter === 'all'
          ? 'Start tracking habits and goals to see your activity here.'
          : `No ${filter} activities found.`}
      </p>
    </div>
  );
}
