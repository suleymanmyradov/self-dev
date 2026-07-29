import { cn } from '@/lib/utils';

interface StreakBarProps {
  /** Array of 14 booleans — oldest first, most recent last */
  days: boolean[];
  /** Current streak count */
  streak: number;
  /** Label, e.g. "Last 14 days · 10 of 14" */
  label?: string;
  className?: string;
}

export function StreakBar({ days, streak, label, className }: StreakBarProps) {
  const display = days.slice(-14);
  const completed = display.filter(Boolean).length;
  const total = display.length;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-medium tabular-nums text-foreground">
          {streak}
          <span className="ml-1 text-xs text-muted-foreground">day streak</span>
        </span>
        {label && (
          <span className="text-xs text-muted-foreground">
            {label}
          </span>
        )}
      </div>
      <div className="flex gap-1" role="img" aria-label={`${completed} of ${total} days completed`}>
        {display.map((done, i) => (
          <div
            key={i}
            className={cn(
              'h-5 flex-1 rounded-sm transition-colors duration-200',
              done ? 'bg-success' : 'bg-muted',
              i === display.length - 1 && !done && 'border border-dashed border-muted-foreground/30',
            )}
          />
        ))}
      </div>
    </div>
  );
}
