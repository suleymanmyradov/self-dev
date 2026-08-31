import type { HelpBlock } from './help-content';
import { cn } from '@/lib/utils';
import { Info, Sparkles, TriangleAlert } from 'lucide-react';

type CalloutTone = 'info' | 'pro' | 'warning';

const calloutStyles: Record<
  CalloutTone,
  { wrapper: string; icon: typeof Info; iconClass: string }
> = {
  info: {
    wrapper: 'border-border/70 bg-muted/40 text-foreground',
    icon: Info,
    iconClass: 'text-foreground',
  },
  pro: {
    wrapper: 'border-border/70 bg-primary/5 text-foreground',
    icon: Sparkles,
    iconClass: 'text-primary',
  },
  warning: {
    wrapper: 'border-destructive/30 bg-destructive/5 text-foreground',
    icon: TriangleAlert,
    iconClass: 'text-destructive',
  },
};

export function HelpBlockRenderer({ block }: { block: HelpBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
          {block.text}
        </p>
      );

    case 'steps':
      return (
        <ol className="ml-1 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[0.7rem] font-medium text-background">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                {item}
              </span>
            </li>
          ))}
        </ol>
      );

    case 'list':
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'callout': {
      const style = calloutStyles[block.tone];
      const Icon = style.icon;
      return (
        <div className={cn('flex gap-3 rounded-lg border p-3.5', style.wrapper)}>
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.iconClass)} />
          <div className="space-y-0.5">
            {block.title && (
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {block.title}
              </p>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {block.text}
            </p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
