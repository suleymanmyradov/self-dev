import { Button } from '@/components/ui/button';
import type { HabitTemplate, GoalTemplate } from '@/types/explore';

interface HabitTemplateCardProps {
  template: HabitTemplate;
  onAdd: (data: { name: string; description: string; category: string }) => void;
  isAdding?: boolean;
}

interface GoalTemplateCardProps {
  template: GoalTemplate;
  onAdd: (data: { title: string; description: string; category: string }) => void;
  isAdding?: boolean;
}

export function HabitTemplateCard({ template, onAdd, isAdding = false }: HabitTemplateCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
        {template.category}
      </div>
      <h3 className="font-display text-lg font-normal leading-tight tracking-tight text-foreground">
        {template.name}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </p>
      <div className="mt-4">
        <Button
          size="sm"
          variant="success"
          className="h-8 rounded-lg text-xs"
          disabled={isAdding}
          onClick={() =>
            onAdd({
              name: template.name,
              description: template.description,
              category: template.category,
            })
          }
        >
          {isAdding ? 'Adding…' : 'Add to Habits'}
        </Button>
      </div>
    </div>
  );
}

export function GoalTemplateCard({ template, onAdd, isAdding = false }: GoalTemplateCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
        {template.category}
      </div>
      <h3 className="font-display text-lg font-normal leading-tight tracking-tight text-foreground">
        {template.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </p>
      <div className="mt-4">
        <Button
          size="sm"
          className="h-8 rounded-lg text-xs"
          disabled={isAdding}
          onClick={() =>
            onAdd({
              title: template.title,
              description: template.description,
              category: template.category,
            })
          }
        >
          {isAdding ? 'Adding…' : 'Add to Goals'}
        </Button>
      </div>
    </div>
  );
}
