import { CheckCircle, Target, Bookmark, ClipboardCheck, ClipboardX } from "lucide-react";
import { formatRelativeTime } from "@/lib/time-format";
import type { Activity, ActivityType } from "@/api";

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  habit_completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  goal_created: <Target className="h-4 w-4 text-blue-500" />,
  goal_completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  article_saved: <Bookmark className="h-4 w-4 text-purple-500" />,
  check_in_completed: <ClipboardCheck className="h-4 w-4 text-emerald-500" />,
  check_in_missed: <ClipboardX className="h-4 w-4 text-orange-500" />,
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <li className="py-3 transition-colors hover:bg-muted/50 rounded-md px-2 -mx-2">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-3">
          {ACTIVITY_ICONS[activity.type]}
          <div>
            <p className="truncate text-sm font-medium">{activity.title}</p>
            <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
          </div>
        </div>
        <span className="ml-3 shrink-0 text-xs text-muted-foreground">
          {formatRelativeTime(activity.createdAt)}
        </span>
      </div>
    </li>
  );
}
