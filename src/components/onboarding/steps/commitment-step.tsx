import { DAILY_COMMITMENT_OPTIONS } from '@/lib/constants';
import { OptionCard } from '../shared';
import type { UpdateField } from '../types';

export function CommitmentStep({
  dailyMinutes,
  update,
}: {
  dailyMinutes: number;
  update: UpdateField;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          How much time, honestly?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Be realistic. A small habit done consistently beats a big one abandoned.
        </p>
      </div>
      <div className="space-y-3">
        {DAILY_COMMITMENT_OPTIONS.map(({ value, label }) => (
          <OptionCard
            key={value}
            selected={dailyMinutes === value}
            onClick={() => update('dailyMinutes', value)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">
                {value <= 15 ? '~1-2 habits' : value <= 30 ? '~2-3 habits' : value <= 45 ? '~3-4 habits' : '~4-5 habits'}
              </span>
            </div>
          </OptionCard>
        ))}
      </div>
      <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
        Smaller commitments are easier to keep. You can always scale up later.
      </div>
    </div>
  );
}
