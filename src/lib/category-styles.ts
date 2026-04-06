import type { ArticleCategory } from '@/types/explore';
import { cn } from '@/lib/utils';

const CATEGORY_STYLES: Record<ArticleCategory, string> = {
  productivity: 'bg-primary/10 text-primary',
  health: 'bg-growth-soft text-growth',
  mindfulness: 'bg-calm-soft text-calm',
  philosophy: 'bg-calm-soft text-calm',
  relationships: 'bg-energy-soft text-energy',
  psychology: 'bg-calm-soft text-calm',
};

const DEFAULT_CATEGORY_STYLE = 'bg-secondary text-secondary-foreground';

export function getCategoryStyle(category: string): string {
  return CATEGORY_STYLES[category as ArticleCategory] ?? DEFAULT_CATEGORY_STYLE;
}

export function getCategoryBadgeClass(category: string): string {
  return cn(getCategoryStyle(category));
}
