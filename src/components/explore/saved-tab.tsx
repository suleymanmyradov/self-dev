"use client";

import Link from "next/link";
import { ArticleCard } from "@/components/explore";
import type { Article, Habit, Goal } from "@/api";

function SavedHabitRow({ habit, onRemove }: { habit: Habit; onRemove: () => void }) {
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
        className="text-xs text-muted-foreground transition-[color] hover:text-destructive"
        aria-label={`Remove ${habit.name} from saved`}
      >
        Remove
      </button>
    </div>
  );
}

function SavedGoalRow({ goal, onRemove }: { goal: Goal; onRemove: () => void }) {
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
        className="text-xs text-muted-foreground transition-[color] hover:text-destructive"
        aria-label={`Remove ${goal.title} from saved`}
      >
        Remove
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
}

export function SavedTab({
  savedArticles,
  savedHabits,
  savedGoals,
  onToggleSave,
  onRemoveSavedById,
}: SavedTabProps) {
  return (
    <>
      {savedArticles.length === 0 && savedHabits.length === 0 && savedGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. Bookmark articles, habits, and goals to find them here.
          </p>
        </div>
      ) : (
        <>
          {savedArticles.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                Articles
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {savedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    isSaved={true}
                    onToggleSave={() => onToggleSave(article.id)}
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
