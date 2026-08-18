'use client';

import { use } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useArticles,
  usePlanAdjustments,
  useHabits,
  useGoals,
  useProfile,
  useCreateCheckIn,
  useCheckInAll,
} from '@/hooks';
import type { CategoriesResponse, ArticlesResponse, Habit } from '@/api';
import { getDateEyebrow, getWeekDayLabels, getWeeklyCheckInCounts } from '@/lib/date-helpers';
import { HabitsSection } from '@/components/home/habits-section';
import { GoalsSection } from '@/components/home/goals-section';
import { ArticlesSection } from '@/components/home/articles-section';
import { useArticleActions } from '@/components/home/use-article-actions';

// =============================================================================
// Props
// =============================================================================

interface HomeClientProps {
  categoriesPromise: Promise<CategoriesResponse>;
  articlesPromise: Promise<ArticlesResponse>;
}

export function HomeClient({ categoriesPromise, articlesPromise }: HomeClientProps) {
  // Articles (SSR-hydrated) — used for the "Worth reading tonight" section.
  use(categoriesPromise);
  const initialArticlesData = use(articlesPromise);
  const { data: articles = [] } = useArticles(undefined, initialArticlesData);

  // Habits + check-ins
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const createCheckIn = useCreateCheckIn();
  const checkInAll = useCheckInAll();

  // Goals — first active goal for "Goal in focus"
  const { data: goals = [] } = useGoals();

  // Profile — for the personalized headline
  const { data: profile } = useProfile();
  const firstName = profile?.fullName?.split(' ')[0] ?? '';

  // Plan adjustment suggestions — used for the coach nudge
  const { data: suggestions = [], applySuggestion, dismissSuggestion } = usePlanAdjustments();

  // Like / save wiring for article cards
  const {
    handleLike,
    isLikePendingFor,
    getIsSaved,
    handleToggleSave,
  } = useArticleActions();

  // =============================================================================
  // Derived data
  // =============================================================================

  const completedHabits = habits.filter((h) => h.completed);
  const pendingHabits = habits.filter((h) => !h.completed);
  const completedCount = completedHabits.length;
  const totalCount = habits.length;
  const remainingCount = pendingHabits.length;
  const allDone = totalCount > 0 && remainingCount === 0;

  const headline = habitsLoading
    ? ''
    : allDone
      ? `All done${firstName ? ', ' + firstName : ''}.`
      : totalCount === 0
        ? `Welcome${firstName ? ', ' + firstName : ''}.`
        : `${remainingCount} left${firstName ? ', ' + firstName : ''}.`;

  const subtitle =
    habitsLoading
      ? ''
      : allDone
        ? "Everything's checked in for today. Nice work."
        : totalCount === 0
          ? 'Add a habit to start tracking your daily check-ins.'
          : pendingHabits.length <= 2
            ? "Neither takes long. Pick one and keep the streak alive."
            : 'A few left to check in. Knock them out one by one.';

  const weekCounts = getWeeklyCheckInCounts(habits);
  const maxWeekCount = Math.max(1, ...weekCounts);
  const todayIndex = weekCounts.length - 1;
  const weekLabels = getWeekDayLabels();
  const weekTotal = weekCounts.reduce((sum, c) => sum + c, 0);
  const activeDays = weekCounts.filter((c) => c > 0).length;

  const coachNudge = suggestions[0];

  const readsTonight = articles.slice(0, 2);

  // =============================================================================
  // Handlers
  // =============================================================================

  const handleCheckIn = (habit: Habit) => {
    if (createCheckIn.isPending) return;
    createCheckIn.mutate({ habitId: habit.id, status: 'completed' });
  };

  const handleCheckInAll = () => {
    if (checkInAll.isPending || pendingHabits.length === 0) return;
    checkInAll.mutate({ habitIds: pendingHabits.map((h) => h.id) });
  };

  const isCheckInPendingFor = (habitId: string) =>
    createCheckIn.isPending && createCheckIn.variables?.habitId === habitId;

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="w-full px-6 lg:px-10 py-8 pb-16">
          <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
            {/* === MAIN COLUMN === */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <header className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground tracking-wider">
                    {getDateEyebrow()}
                  </p>
                  <h1 className="font-display text-3xl md:text-4xl leading-[1.15] tracking-tight mt-2 text-foreground">
                    {headline}
                  </h1>
                  <p className="mt-2 text-muted-foreground text-sm max-w-[48ch]">
                    {subtitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                    {completedCount}
                    <span className="text-muted-foreground">/{totalCount}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">checked in</p>
                </div>
              </header>

              {/* Hairline divider */}
              <hr className="border-border my-6" />

              {/* Today section */}
              <HabitsSection
                habits={habits}
                pendingHabits={pendingHabits}
                completedHabits={completedHabits}
                onCheckIn={handleCheckIn}
                onCheckInAll={handleCheckInAll}
                isCheckInPendingFor={isCheckInPendingFor}
                isCheckInAllPending={checkInAll.isPending}
              />

              {/* Hairline divider */}
              <hr className="border-border my-6" />

              {/* Worth reading tonight */}
              <ArticlesSection
                articles={readsTonight}
                onLike={handleLike}
                onToggleSave={handleToggleSave}
                isLikePendingFor={isLikePendingFor}
                getIsSaved={getIsSaved}
              />
            </div>

            {/* === RIGHT SIDEBAR (330px, hidden on mobile) === */}
            <aside className="hidden md:block w-[330px] shrink-0">
              <div className="sticky top-0 space-y-5">
                {/* Coach nudge card */}
                {coachNudge && (
                  <div className="rounded-xl bg-foreground text-background p-5">
                    <p className="font-mono text-[0.65rem] tracking-widest text-background/60 mb-3">
                      FROM YOUR COACH
                    </p>
                    <p className="text-sm leading-relaxed text-background/90 mb-4">
                      {coachNudge.suggestion}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => applySuggestion(coachNudge.id)}
                      >
                        Move it
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissSuggestion(coachNudge.id)}
                        className="text-background/70 hover:text-background hover:bg-background/10"
                      >
                        Not now
                      </Button>
                    </div>
                  </div>
                )}

                {/* This week chart */}
                <div className="rounded-xl bg-card border border-border p-5">
                  <h3 className="font-semibold text-xs text-foreground mb-4">This week</h3>
                  <div className="flex items-end justify-between gap-1.5 h-24">
                    {weekCounts.map((count, i) => {
                      const heightPct = (count / maxWeekCount) * 100;
                      const isToday = i === todayIndex;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                          <div className="w-full flex items-end justify-center h-16">
                            <div
                              className={cn(
                                'w-full max-w-[20px] rounded-sm transition-[height] duration-300',
                                isToday ? 'bg-success' : count > 0 ? 'bg-success/60' : 'bg-muted',
                              )}
                              style={{ height: `${Math.max(4, heightPct)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              'font-mono text-[0.6rem]',
                              isToday ? 'text-foreground font-medium' : 'text-muted-foreground',
                            )}
                          >
                            {weekLabels[i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    {allDone
                      ? "Perfect week so far. Keep the momentum going."
                      : weekTotal === 0
                        ? "No check-ins yet this week. Today's a good day to start."
                        : `${weekTotal} check-in${weekTotal === 1 ? "" : "s"} across ${activeDays} day${activeDays === 1 ? "" : "s"} this week.`}
                  </p>
                </div>

                {/* Goal in focus */}
                <GoalsSection goals={goals} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
