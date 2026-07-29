import { Textarea } from '@/components/ui/textarea';
import type { UpdateField } from '../types';

export function MotivationStep({
  motivation,
  update,
}: {
  motivation: string;
  update: UpdateField;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          Why does this matter to you?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Understanding your &ldquo;why&rdquo; makes it easier to stay consistent when motivation dips.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Your motivation</label>
        <Textarea
          placeholder="e.g. I want to feel confident in my exams and prove to myself I can be disciplined."
          value={motivation}
          onChange={(e) => update('motivation', e.target.value)}
          rows={4}
          autoFocus
        />
      </div>
    </div>
  );
}
