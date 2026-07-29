import { cn } from '@/lib/utils';
import { CHECK_IN_HOURS } from '@/lib/constants';
import type { UpdateField } from '../types';

export function CheckInStep({
  checkInTime,
  update,
}: {
  checkInTime: string;
  update: UpdateField;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          When should I check in with you?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick the time you are most likely to reflect on your day.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Daily check-in time</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CHECK_IN_HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              onClick={() => update('checkInTime', hour)}
              className={cn(
                'rounded-lg border px-2 py-2 text-xs font-mono tabular-nums font-medium transition-[color,background-color,border-color]',
                checkInTime === hour
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border bg-card hover:bg-muted/30'
              )}
            >
              {hour}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
