import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCOUNTABILITY_STYLES,
  ACCOUNTABILITY_STYLE_LABELS,
  ACCOUNTABILITY_STYLE_DESCRIPTIONS,
  ACCOUNTABILITY_STYLE_TONES,
} from '@/lib/constants';
import type { AccountabilityStyle } from '@/lib/constants';
import { OptionCard } from '../shared';
import type { UpdateField } from '../types';

export function AccountabilityStep({
  accountabilityStyle,
  update,
}: {
  accountabilityStyle: AccountabilityStyle;
  update: UpdateField;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          How should I hold you accountable?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the coaching style that works best for you.
        </p>
      </div>
      <div className="space-y-3">
        {ACCOUNTABILITY_STYLES.map((style) => (
          <OptionCard
            key={style}
            selected={accountabilityStyle === style}
            onClick={() => update('accountabilityStyle', style)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">
                {ACCOUNTABILITY_STYLE_LABELS[style]}
              </span>
              {accountabilityStyle === style && (
                <Check className="h-4 w-4" />
              )}
            </div>
            <p className={cn(
              'text-xs mb-2',
              accountabilityStyle === style ? 'text-background/70' : 'text-muted-foreground'
            )}>
              {ACCOUNTABILITY_STYLE_DESCRIPTIONS[style]}
            </p>
            <p className={cn(
              'text-xs italic border-t pt-2 mt-2',
              accountabilityStyle === style
                ? 'text-background/60 border-background/20'
                : 'text-muted-foreground/80 border-border/40'
            )}>
              &ldquo;{ACCOUNTABILITY_STYLE_TONES[style]}&rdquo;
            </p>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
