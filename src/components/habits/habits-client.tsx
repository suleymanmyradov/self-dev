"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitRow } from "@/components/habits/habit-row";
import { GoalCard } from "@/components/habits/goal-card";
import { LimitUpgradePrompt } from "@/components/habits/limit-upgrade-prompt";
import { useHabitsFilters } from "@/components/habits/use-habits-filters";
import type { StatusFilter } from "@/components/habits/use-habits-filters";
import type { Habit, HabitsResponse, Goal, GoalsResponse } from "@/api";
import type { CheckInSubmitData } from "@/components/check-in/check-in-modal";
import { useUIStore } from "@/store/uiStore";
import { useBillingUIStore } from "@/store/billing-ui";
import { useShallow } from "zustand/react/shallow";

const HabitFormDialog = dynamic(() => import("@/components/habits/habit-form-dialog").then((mod) => mod.HabitFormDialog));
const GoalFormDialog = dynamic(() => import("@/components/goals/goal-form-dialog").then((mod) => mod.GoalFormDialog));
const CheckInModal = dynamic(() => import("@/components/check-in/check-in-modal").then((mod) => mod.CheckInModal));
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useHabitForm,
  useHabitEditForm,
  useConfirmDelete,
  useCreateCheckIn,
  useEntitlements,
  useTrackUpgradeEvent,
  useBillingOverview,
  useCategories,
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useToggleGoal,
  useUpdateGoalProgress,
} from "@/hooks";

interface HabitsClientProps {
  habitsPromise: Promise<HabitsResponse>;
  goalsPromise: Promise<GoalsResponse>;
}

export function HabitsClient({ habitsPromise, goalsPromise }: HabitsClientProps) {
  const habitsData = use(habitsPromise);
  const { data: habits = [] } = useHabits({ page: 1, limit: 100 }, habitsData);
  const goalsData = use(goalsPromise);
  const { data: goals = [] } = useGoals(goalsData);
  // todayCheckIns is used by the check-in modal context; the data is also
  // available via the checkIns query key for invalidation.
  const { data: entitlements } = useEntitlements();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";
  const trackUpgradeEvent = useTrackUpgradeEvent();

  // Categories are fetched from the DB (source of truth) — not a hardcoded enum.
  const { data: habitCategories = [] } = useCategories('habit');
  const { data: goalCategories = [] } = useCategories('goal');

  // Mutations — habits
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const checkInMutation = useCreateCheckIn();

  // Mutations — goals
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const toggleGoalMutation = useToggleGoal();
  const updateGoalProgressMutation = useUpdateGoalProgress();

  // Billing / upgrade UI from store
  const { upgradePromptOpen, upgradeSurface, upgradeTrigger, showUpgradePrompt, dismissUpgradePrompt } =
    useBillingUIStore(
      useShallow((s) => ({
        upgradePromptOpen: s.upgradePromptOpen,
        upgradeSurface: s.upgradeSurface,
        upgradeTrigger: s.upgradeTrigger,
        showUpgradePrompt: s.showUpgradePrompt,
        dismissUpgradePrompt: s.dismissUpgradePrompt,
      }))
    );

  // Check-in modal state from UI store (modal kept for retro check-ins from /progress)
  const { checkInModalOpen, checkInHabitId, closeCheckInModal } = useUIStore(
    useShallow((s) => ({
      checkInModalOpen: s.checkInModalOpen,
      checkInHabitId: s.checkInHabitId,
      closeCheckInModal: s.closeCheckInModal,
    }))
  );
  const checkInHabit = habits.find((h) => h.id === checkInHabitId);

  const {
    filterAndSort,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
  } = useHabitsFilters(habits);

  // Create habit form
  const createForm = useHabitForm();

  // "Add to Plan" from an article: when the user clicks "Add to Plan" on an
  // article page, they land on /plan with query params pre-filling a new habit.
  // On mount (or when the params first become available), seed the create form
  // with the article data and open the dialog. The query params are then
  // stripped from the URL so a refresh doesn't re-open the dialog.
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (searchParams?.get('newHabitFromArticle') !== '1') return;
    createForm.setForm({
      name: searchParams.get('name') ?? '',
      description: searchParams.get('description') ?? '',
      category: searchParams.get('category') ?? '',
    });
    createForm.setOpen(true);
    // Clear the query params so the dialog doesn't re-open on refresh/back.
    router.replace('/plan');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Edit habit form
  const editForm = useHabitEditForm();

  // Delete habit confirmation
  const habitDeleteConfirm = useConfirmDelete<string>();
  const handleHabitDelete = () => {
    const id = habitDeleteConfirm.startDeleting();
    if (id) {
      deleteHabitMutation.mutate(id, {
        onSettled: () => habitDeleteConfirm.stopDeleting(id),
      });
    }
  };

  // Goal create/edit state
  const [goalCreateOpen, setGoalCreateOpen] = useState(false);
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Goal delete confirmation
  const goalDeleteConfirm = useConfirmDelete<string>();
  const handleGoalDelete = () => {
    const id = goalDeleteConfirm.startDeleting();
    if (id) {
      deleteGoalMutation.mutate(id, {
        onSettled: () => goalDeleteConfirm.stopDeleting(id),
      });
    }
  };

  // Check-in handler — one-tap check-in, no modal
  const handleCheckIn = useCallback((habit: Habit) => {
    checkInMutation.mutate({ habitId: habit.id, status: 'completed' });
  }, [checkInMutation]);

  const handleSubmitCheckIn = (data: CheckInSubmitData) => {
    checkInMutation.mutate(data, {
      onSuccess: () => {
        closeCheckInModal();
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to submit check-in";
        toast.error(errorMessage);
      },
    });
  };

  // Goal handlers
  const handleCreateGoal = useCallback(
    (validated: { title: string; description: string; category: string; dueDate?: string; relatedHabitIds: string[] }) => {
      if (entitlements && !entitlements.canCreateGoal) {
        showUpgradePrompt("goal_create_limit", "goal_limit");
        trackUpgradeEvent.mutate({
          eventType: "prompt_viewed",
          surface: "goal_create_limit",
          trigger: "goal_limit",
          planCode: "pro",
        });
        return;
      }
      createGoalMutation.mutate(validated, {
        onSuccess: () => {
          setGoalCreateOpen(false);
        },
        onError: (error: unknown) => {
          const err = error as { data?: { code?: string } };
          if (err?.data?.code === "plan_limit_reached") {
            showUpgradePrompt("goal_create_limit", "goal_limit");
          }
        },
      });
    },
    [entitlements, showUpgradePrompt, trackUpgradeEvent, createGoalMutation]
  );

  const openEditGoal = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setGoalEditOpen(true);
  }, []);

  const handleSaveEditGoal = useCallback(
    (validated: { title: string; description: string; category: string; dueDate?: string; relatedHabitIds: string[] }) => {
      if (!editingGoal) return;
      updateGoalMutation.mutate(
        { id: editingGoal.id, data: validated },
        { onSuccess: () => setGoalEditOpen(false) }
      );
    },
    [editingGoal, updateGoalMutation]
  );

  const handleProgressChange = useCallback(
    (progress: number) => {
      if (!editingGoal) return;
      updateGoalProgressMutation.mutate({ id: editingGoal.id, progress });
    },
    [editingGoal, updateGoalProgressMutation]
  );

  const handleToggleGoal = useCallback((id: string) => {
    toggleGoalMutation.mutate(id);
  }, [toggleGoalMutation]);

  // Group habits by their parent goal.
  // Goals link to habits via `relatedHabitIds`; habits do not have a `goalId` field.
  const { habitsByGoalId, unassignedHabits } = useMemo(() => {
    const byGoal = new Map<string, Habit[]>();
    const assignedIds = new Set<string>();

    for (const goal of goals) {
      const ids = goal.relatedHabitIds ?? [];
      if (ids.length === 0) {
        byGoal.set(goal.id, []);
        continue;
      }
      const byId = new Map(habits.map((h) => [h.id, h]));
      const linked = ids
        .map((id) => byId.get(id))
        .filter((h): h is Habit => h !== undefined);
      byGoal.set(goal.id, linked);
      linked.forEach((h) => assignedIds.add(h.id));
    }

    const unassigned = habits.filter((h) => !assignedIds.has(h.id));
    return { habitsByGoalId: byGoal, unassignedHabits: unassigned };
  }, [habits, goals]);

  const visibleUnassigned = useMemo(() => filterAndSort(unassignedHabits), [filterAndSort, unassignedHabits]);

  // Free plan limit
  const goalLimit = entitlements?.activeGoalLimit ?? 3;
  const goalsUsed = goals.length;
  const atGoalLimit = !isPro && goalsUsed >= goalLimit;

  const statusPills: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Plan</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Three goals, nine habits. A habit without a goal is just a chore.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => createForm.setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New habit
                </Button>
                <Button size="sm" onClick={() => setGoalCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New goal
                </Button>
              </div>
            </div>
          </header>

          {/* Filter bar */}
          <section className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            {/* Status pill chips */}
            <div className="flex items-center gap-1.5">
              {statusPills.map((pill) => (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setStatusFilter(pill.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === pill.value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-border" />

            {/* Category select */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger size="sm" className="h-8 w-auto gap-1.5 border-border text-xs">
                    <span className="text-muted-foreground">Category:</span>
                    <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                {habitCategories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug} className="capitalize">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort select */}
            <Select value={sortBy} onValueChange={(v) => { if (v === 'streak' || v === 'name') setSortBy(v); }}>
              <SelectTrigger size="sm" className="h-8 w-auto gap-1.5 border-border text-xs">
                    <span className="text-muted-foreground">Sort:</span>
                    <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streak">streak</SelectItem>
                <SelectItem value="name">name</SelectItem>
              </SelectContent>
            </Select>
          </section>

          {/* Goal cards with nested habits */}
          <section className="space-y-4">
            {goals.map((goal) => {
              const goalHabits = habitsByGoalId.get(goal.id) ?? [];
              const visibleGoalHabits = filterAndSort(goalHabits);

              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  habits={goalHabits}
                  visibleHabits={visibleGoalHabits}
                  isCheckInPending={checkInMutation.isPending}
                  onCheckIn={handleCheckIn}
                  onEditHabit={editForm.openEdit}
                  onDeleteHabit={habitDeleteConfirm.confirmDelete}
                  onEditGoal={openEditGoal}
                  onDeleteGoal={goalDeleteConfirm.confirmDelete}
                  onToggleGoal={handleToggleGoal}
                  onAddHabit={() => createForm.setOpen(true)}
                />
              );
            })}
          </section>

          {/* Unassigned habits card */}
          {visibleUnassigned.length > 0 && (
            <section className="mt-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold">Habits without a goal</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {visibleUnassigned.map((h) => h.name).join(' · ')}
                  {visibleUnassigned.length > 0 && ' — '}
                  {visibleUnassigned.length === 1
                    ? 'one habit with no goal behind it.'
                    : `${visibleUnassigned.length} habits with no goal behind them.`}
                </p>
                <div className="mt-4 divide-y divide-border border-t border-border">
                  {visibleUnassigned.map((h) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      onCheckIn={handleCheckIn}
                      onEdit={editForm.openEdit}
                      onDelete={habitDeleteConfirm.confirmDelete}
                      isPending={checkInMutation.isPending}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-success transition-colors hover:text-success/80"
                >
                  Assign or archive
                </button>
              </div>
            </section>
          )}

          {/* Free plan limit card */}
          {atGoalLimit && (
            <section className="mt-4">
              <div className="flex items-center justify-between rounded-xl border border-dashed border-border p-5">
                <div>
                  <p className="text-sm font-medium">Free plan · {goalsUsed} of {goalLimit} goals used</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Upgrade to Pro for unlimited goals.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => showUpgradePrompt("goal_create_limit", "goal_limit")}>
                  See Pro
                </Button>
              </div>
            </section>
          )}

          {/* Empty state — no goals and no habits */}
          {goals.length === 0 && habits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="font-display text-lg font-semibold">Nothing planned yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first goal and add habits to it. A habit without a goal is just a chore.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => createForm.setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New habit
                </Button>
                <Button size="sm" onClick={() => setGoalCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New goal
                </Button>
              </div>
            </div>
          )}

          {/* Habit / goal limit upgrade prompts */}
          <LimitUpgradePrompt
            open={upgradePromptOpen}
            surface={upgradeSurface}
            trigger={upgradeTrigger}
            isPro={isPro}
            onDismiss={dismissUpgradePrompt}
          />
        </div>
      </div>

      {/* Create Habit Dialog */}
      <HabitFormDialog
        open={createForm.open}
        title="New habit"
        onOpenChange={createForm.setOpen}
        initialValues={createForm.form}
        onSubmit={(vals) => {
          // Check entitlement before creating
          if (entitlements && !entitlements.canCreateHabit) {
            showUpgradePrompt("habit_create_limit", "habit_limit");
            trackUpgradeEvent.mutate({
              eventType: "prompt_viewed",
              surface: "habit_create_limit",
              trigger: "habit_limit",
              planCode: "pro",
            });
            return;
          }
          createHabitMutation.mutate(
            {
              name: vals.name.trim(),
              description: vals.description.trim(),
              category: vals.category,
            },
            {
              onError: (error: unknown) => {
                const err = error as { data?: { code?: string } };
                if (err?.data?.code === "plan_limit_reached") {
                  showUpgradePrompt("habit_create_limit", "habit_limit");
                }
              },
            }
          );
          createForm.reset();
        }}
        categories={habitCategories}
      />

      {/* Edit Habit Dialog */}
      <HabitFormDialog
        open={editForm.open}
        title="Edit habit"
        onOpenChange={editForm.setOpen}
        initialValues={editForm.form}
        onSubmit={(vals) => {
          if (editForm.editingId) {
            updateHabitMutation.mutate({
              id: editForm.editingId,
              data: {
                name: vals.name.trim(),
                description: vals.description.trim(),
                category: vals.category,
              },
            });
            editForm.reset();
          }
        }}
        categories={habitCategories}
      />

      {/* Create Goal Dialog */}
      <GoalFormDialog
        open={goalCreateOpen}
        onOpenChange={setGoalCreateOpen}
        mode="create"
        categories={goalCategories}
        habits={habits}
        onSubmit={handleCreateGoal}
      />

      {/* Edit Goal Dialog */}
      <GoalFormDialog
        open={goalEditOpen}
        onOpenChange={setGoalEditOpen}
        mode="edit"
        categories={goalCategories}
        habits={habits}
        initialValues={editingGoal ? {
          title: editingGoal.title,
          description: editingGoal.description,
          category: editingGoal.category,
          dueDate: editingGoal.dueDate,
          progress: editingGoal.progress,
          relatedHabitIds: editingGoal.relatedHabitIds ?? [],
        } : undefined}
        onProgressChange={handleProgressChange}
        onSubmit={handleSaveEditGoal}
      />

      {/* Delete Habit Confirmation */}
      <Dialog open={habitDeleteConfirm.open} onOpenChange={habitDeleteConfirm.setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete habit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this habit? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => habitDeleteConfirm.setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleHabitDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Confirmation */}
      <Dialog open={goalDeleteConfirm.open} onOpenChange={goalDeleteConfirm.setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete goal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => goalDeleteConfirm.setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleGoalDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-In Modal */}
      <CheckInModal
        open={checkInModalOpen}
        onOpenChange={closeCheckInModal}
        habit={checkInHabit}
        onSubmit={handleSubmitCheckIn}
        isSubmitting={checkInMutation.isPending}
      />
    </div>
  );
}
