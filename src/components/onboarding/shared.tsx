import { cn } from '@/lib/utils';

// ─── Step header component ────────────────────────────────────────────────────

export function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      {/* Progress bar: segments, 3px tall, rounded-full */}
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-[3px] flex-1 rounded-full transition-colors',
              i < step ? 'bg-foreground' : 'bg-secondary'
            )}
          />
        ))}
      </div>
      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        Step {step} of {total}
      </p>
    </div>
  );
}

// ─── Option card (full-width, selectable) ─────────────────────────────────────

export function OptionCard({
  selected,
  onClick,
  children,
  dashed = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl p-4 text-left transition-[color,background-color,border-color]',
        dashed && !selected && 'border border-dashed border-border bg-card/50',
        !dashed && !selected && 'border border-border bg-card',
        selected && 'bg-foreground text-background border border-foreground',
        !selected && !dashed && 'hover:bg-muted/30',
        !selected && dashed && 'hover:bg-muted/20'
      )}
    >
      {children}
    </button>
  );
}
