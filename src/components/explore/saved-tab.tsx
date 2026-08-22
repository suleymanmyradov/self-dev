"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ArticleCard } from "@/components/explore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article, Habit, Goal } from "@/api";

function SavedHabitRow({ habit, onRemove, isRemoving }: { habit: Habit; onRemove: () => void; isRemoving: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Link href="/plan" className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{habit.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {habit.category || 'Habit'} · {habit.streak}d streak
        </p>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        className="text-xs text-muted-foreground transition-[color] hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove ${habit.name} from saved`}
      >
        {isRemoving ? 'Removing…' : 'Remove'}
      </button>
    </div>
  );
}

function SavedGoalRow({ goal, onRemove, isRemoving }: { goal: Goal; onRemove: () => void; isRemoving: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Link href="/plan" className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{goal.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {goal.category} · {Math.round(goal.progress)}%
        </p>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        className="text-xs text-muted-foreground transition-[color] hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Remove ${goal.title} from saved`}
      >
        {isRemoving ? 'Removing…' : 'Remove'}
      </button>
    </div>
  );
}

interface SavedTabProps {
  savedArticles: Article[];
  savedHabits: { habit: Habit; savedItemId: string }[];
  savedGoals: { goal: Goal; savedItemId: string }[];
  onToggleSave: (articleId: string) => void;
  onRemoveSavedById: (savedItemId: string) => void;
  onExplore: () => void;
  isLoading: boolean;
  isRemoving: boolean;
}

export function SavedTab({
  savedArticles,
  savedHabits,
  savedGoals,
  onToggleSave,
  onRemoveSavedById,
  onExplore,
  isLoading,
  isRemoving,
}: SavedTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading saved items">
        <Skeleton className="h-3 w-20" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {savedArticles.length === 0 && savedHabits.length === 0 && savedGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Bookmark className="mb-4 size-10 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-foreground">Nothing saved yet</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Bookmark articles, habits, and goals to keep useful ideas close at hand.
          </p>
          <Button type="button" size="sm" className="mt-4" onClick={onExplore}>
            Explore the library
          </Button>
        </div>
      ) : (
        <>
          {savedArticles.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Articles
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isSaved={true}
                    onToggleSave={() => onToggleSave(article.id)}
                    isSavePending={isRemoving}
                  />
                ))}
              </div>
            </section>
          )}

          {savedHabits.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Habits
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedHabits.map(({ habit, savedItemId }) => (
                  <SavedHabitRow
                    key={habit.id}
                    habit={habit}
                    onRemove={() => onRemoveSavedById(savedItemId)}
                    isRemoving={isRemoving}
                  />
                ))}
              </div>
            </section>
          )}

          {savedGoals.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Goals
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedGoals.map(({ goal, savedItemId }) => (
                  <SavedGoalRow
                    key={goal.id}
                    goal={goal}
                    onRemove={() => onRemoveSavedById(savedItemId)}
                    isRemoving={isRemoving}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
