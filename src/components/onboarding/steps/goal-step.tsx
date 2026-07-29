import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Category } from '@/api';
import type { UpdateField } from '../types';

export function GoalStep({
  goalTitle,
  goalCategory,
  update,
  categories,
}: {
  goalTitle: string;
  goalCategory: string;
  update: UpdateField;
  categories: Category[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">
          What are you hoping changes?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with one clear goal. You can add more later.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your goal</label>
          <Input
            placeholder="e.g. Study consistently for my exams"
            value={goalTitle}
            onChange={(e) => update('goalTitle', e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">Loading categories…</p>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => update('goalCategory', cat.slug)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-[color,background-color,border-color]',
                    goalCategory === cat.slug
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border bg-card hover:bg-muted/30'
                  )}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
