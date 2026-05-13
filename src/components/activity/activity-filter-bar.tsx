import { Button } from "@/components/ui/button";
import type { ActivityType } from "@/api";

const ACTIVITY_FILTERS: { label: string; value: ActivityType | 'all' | 'check_in' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Check-ins', value: 'check_in' },
  { label: 'Habits', value: 'habit_completed' },
  { label: 'Goals', value: 'goal_created' },
  { label: 'Articles', value: 'article_saved' },
];

interface ActivityFilterBarProps {
  filter: ActivityType | 'all' | 'check_in';
  onFilterChange: (filter: ActivityType | 'all' | 'check_in') => void;
}

export function ActivityFilterBar({ filter, onFilterChange }: ActivityFilterBarProps) {
  return (
    <div className="flex gap-1">
      {ACTIVITY_FILTERS.map((f) => (
        <Button
          key={f.value}
          variant={filter === f.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(f.value)}
          className="h-7 text-xs"
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
