'use client';

import { use, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArticleCardGrid } from '@/components/home/article-card-grid';
import { PlanAdjustmentCard } from '@/components/plan-adjustment-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, ArrowRight, Lightbulb } from 'lucide-react';
import { listCategories, listArticles } from '@/api';
import { usePlanAdjustments, useBillingOverview } from '@/hooks';
import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import type { HabitsResponse, CheckInsResponse, CategoriesResponse, ArticlesResponse } from '@/api';
import { useSearchParamState } from '@/lib/url-state';

const TAB_TRIGGER_CLASS =
  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold';

const DEFAULT_CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'habits', label: 'Habits' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'productivity', label: 'Productivity' },
];

interface HomeClientProps {
  categoriesPromise: Promise<CategoriesResponse>;
  articlesPromise: Promise<ArticlesResponse>;
  habitsPromise: Promise<HabitsResponse>;
  checkInsPromise: Promise<CheckInsResponse>;
}

export function HomeClient({ categoriesPromise, articlesPromise, habitsPromise, checkInsPromise }: HomeClientProps) {
  const [filter, setFilter] = useSearchParamState('category', 'all');

  const categoriesData = use(categoriesPromise);
  const initialArticlesData = use(articlesPromise);
  const habitsData = use(habitsPromise);
  const checkInsData = use(checkInsPromise);

  const habits = habitsData.data ?? [];
  const todayCheckIns = checkInsData.data ?? [];

  const [articles, setArticles] = useState(initialArticlesData.data ?? []);
  const [isArticlesPending, startArticlesTransition] = useTransition();

  // Fetch plan adjustment suggestions
  const { suggestions = [], loading: suggestionsLoading, applySuggestion, dismissSuggestion } = usePlanAdjustments();

  // Billing entitlements for plan adjustment limit
  const { data: billing } = useBillingOverview();
  const canCreatePlanAdjustment = billing?.entitlements?.canCreatePlanAdjustment ?? true;

  const checkInStats = useMemo(() => {
    if (habits.length === 0) return null;
    const checkedHabitIds = new Set(todayCheckIns.map((ci) => ci.habitId));
    const checkedCount = habits.filter((h) => checkedHabitIds.has(h.id)).length;
    const remainingCount = habits.length - checkedCount;
    return { checkedCount, remainingCount, total: habits.length, allChecked: remainingCount === 0 };
  }, [habits, todayCheckIns]);

  const categories = useMemo(() => {
    const cats = categoriesData.data;
    if (cats && cats.length > 0) {
      const mapped = [
        { value: 'all', label: 'All' },
        ...cats.map((c) => ({ value: c.slug, label: c.name })),
      ];
      return mapped;
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesData]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    startArticlesTransition(async () => {
      const params = value !== 'all' ? { category: value } : undefined;
      const fresh = await listArticles(params);
      setArticles(fresh.data ?? []);
    });
  };

  const isLoading = isArticlesPending;

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Ambient background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-ambient-calm opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-ambient-growth opacity-15 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full px-6 lg:px-10 pb-10">
          {/* Today's Check-in Widget */}
          {checkInStats && !checkInStats.allChecked && (
            <div className="mb-6 card-elevated rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CircleDashed className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Today&apos;s Check-in</p>
                    <p className="text-xs text-muted-foreground">
                      {checkInStats.remainingCount} habit{checkInStats.remainingCount === 1 ? '' : 's'} left
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {checkInStats.checkedCount}/{checkInStats.total}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/habits" className="flex items-center gap-1">
                      Check In <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
          {checkInStats?.allChecked && (
            <div className="mb-6 card-elevated rounded-xl p-4 bg-growth/5 border-growth/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-growth" />
                <div>
                  <p className="text-sm font-medium text-growth">All habits checked in today!</p>
                  <p className="text-xs text-muted-foreground">
                    {checkInStats.checkedCount}/{checkInStats.total} completed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Adjustment Suggestions */}
          {suggestions.length > 0 && !suggestionsLoading && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-energy" />
                <h3 className="text-sm font-medium">Suggestions for you</h3>
              </div>
              <div className="space-y-3">
                {suggestions.slice(0, 2).map((suggestion) => (
                  <PlanAdjustmentCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={() => applySuggestion(suggestion.id)}
                    onDismiss={() => dismissSuggestion(suggestion.id)}
                    loading={suggestionsLoading}
                  />
                ))}
              </div>
              {!canCreatePlanAdjustment && (
                <div className="mt-3">
                  <UpgradePrompt
                    surface="plan_adjustments"
                    trigger="plan_adjustments"
                    title=""
                    description=""
                    compact
                    isPro={billing?.subscription?.planCode === "pro"}
                  />
                </div>
              )}
            </div>
          )}

          <Tabs
            value={filter}
            onValueChange={(v) => handleFilterChange(v)}
            className="mt-2 mb-6 w-full"
          >
            <TabsList className="h-auto w-fit bg-secondary/50 p-1 rounded-lg">
              {categories.map(({ value, label }) => (
                <TabsTrigger key={value} className={TAB_TRIGGER_CLASS} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* === 4-COLUMN ARTICLE GRID === */}
          <section>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground animate-pulse">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-muted-foreground text-sm">No articles found</p>
                <p className="text-muted-foreground/60 text-xs">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {articles.map((a, i) => (
                  <ArticleCardGrid
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    excerpt={a.excerpt}
                    image={a.imageUrl ?? '/images/article-placeholder.svg'}
                    category={a.category?.name}
                    postedAt={a.publishedAt}
                    likes={0}
                    saves={0}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
