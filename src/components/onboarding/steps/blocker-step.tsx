import { Input } from '@/components/ui/input';
import { OptionCard } from '../shared';
import type { UpdateField } from '../types';

export function BlockerStep({
  blocker,
  update,
}: {
  blocker: string;
  update: UpdateField;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          What usually stops you?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Knowing your main obstacle helps me give you more useful coaching.
        </p>
      </div>
      <div className="space-y-3">
        {['Lack of time', 'Low motivation', 'Too distracted', 'Unclear plan'].map(
          (option) => (
            <OptionCard
              key={option}
              selected={blocker === option}
              onClick={() => update('blocker', option === blocker ? '' : option)}
            >
              <span className="text-sm font-medium">{option}</span>
            </OptionCard>
          )
        )}
        <OptionCard
          selected={blocker === 'Other'}
          dashed
          onClick={() => update('blocker', blocker === 'Other' ? '' : 'Other')}
        >
          <span className="text-sm text-muted-foreground">Something else…</span>
        </OptionCard>
        {blocker === 'Other' && (
          <Input
            placeholder="Describe your main blocker..."
            autoFocus
            onChange={(e) => update('blocker', e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
