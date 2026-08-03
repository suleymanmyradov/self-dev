import { formatRelativeTime } from "@/lib/time-format";
import type { Activity } from "@/api";

/** "Recent activity" sidebar card showing the latest user actions. */
export function ActivityCard({ activities }: { activities: Activity[] }) {
  return (
    <div className="rounded-xl bg-card p-5">
      <h2 className="text-sm font-semibold">Recent activity</h2>
      <ul className="mt-3 space-y-2.5">
        {activities.length === 0 ? (
          <li className="text-sm text-muted-foreground">No recent activity.</li>
        ) : (
          activities.slice(0, 6).map((a) => (
            <li key={a.id} className="flex items-start gap-2.5">
              <span className="font-mono text-xs tabular-nums text-muted-foreground shrink-0" style={{ width: 44 }}>
                {formatRelativeTime(a.createdAt)}
              </span>
              <span className="text-sm leading-snug">
                {a.title}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
