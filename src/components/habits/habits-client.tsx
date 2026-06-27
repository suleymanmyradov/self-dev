"use client";

import { use, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Plus, RotateCcw, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitCard } from "@/components/habits/habit-card";
import { CheckInBanner } from "@/components/check-in/check-in-banner";
import type { Habit, HabitsResponse, CheckInsResponse } from "@/api";
import type { CheckInSubmitData } from "@/components/check-in/check-in-modal";
import { useUIStore } from "@/store/uiStore";
import { useBillingUIStore } from "@/store/billing-ui";
import { useShallow } from "zustand/react/shallow";

const HabitFormDialog = dynamic(() => import("@/components/habits/habit-form-dialog").then((mod) => mod.HabitFormDialog));
const CheckInModal = dynamic(() => import("@/components/check-in/check-in-modal").then((mod) => mod.CheckInModal));
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useResetTodayHabits,
  useHabitFilters,
  useHabitForm,
  useHabitEditForm,
  useConfirmDelete,
  useTodayCheckIns,
  useCreateCheckIn,
  useCheckInAll,
  useEntitlements,
  useTrackUpgradeEvent,
  useBillingOverview,
  useCategories,
} from "@/hooks";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

interface HabitsClientProps {
  habitsPromise: Promise<HabitsResponse>;
  checkInsPromise: Promise<CheckInsResponse>;
}

export function HabitsClient({ habitsPromise, checkInsPromise }: HabitsClientProps) {
  const habitsData = use(habitsPromise);
  const { data: habits = [] } = useHabits({ page: 1, limit: 100 }, habitsData);
  const checkInsData = use(checkInsPromise);
  const { data: todayCheckIns = [] } = useTodayCheckIns(checkInsData);
  const { data: entitlements } = useEntitlements();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";
  const trackUpgradeEvent = useTrackUpgradeEvent();

  // Categories are fetched from the DB (source of truth) — not a hardcoded enum.
  const { data: categories = [] } = useCategories('habit');

  // Mutations
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const resetMutation = useResetTodayHabits();
  const checkInMutation = useCreateCheckIn();
  const checkInAllMutation = useCheckInAll();

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

  // Check-in modal state from UI store
  const { checkInModalOpen, checkInHabitId, openCheckInModal, closeCheckInModal } = useUIStore(
    useShallow((s) => ({
      checkInModalOpen: s.checkInModalOpen,
      checkInHabitId: s.checkInHabitId,
      openCheckInModal: s.openCheckInModal,
      closeCheckInModal: s.closeCheckInModal,
    }))
  );
  const checkInHabit = habits.find((h) => h.id === checkInHabitId);

  // Filters
  const { categoryFilter, setCategoryFilter, sortBy, setSortBy, visibleHabits, completionPct } =
    useHabitFilters(habits);

  // Create form
  const createForm = useHabitForm();

  // Edit form
  const editForm = useHabitEditForm();

  // Delete confirmation
  const deleteConfirm = useConfirmDelete<string>();
  const handleDelete = () => {
    const id = deleteConfirm.startDeleting();
    if (id) {
      deleteMutation.mutate(id, {
        onSettled: () => deleteConfirm.stopDeleting(id),
      });
    }
  };

  // Reset confirmation — Reset destroys today's check-ins for every habit, so
  // require an explicit confirmation dialog (same pattern as delete).
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const handleResetConfirm = () => {
    setResetConfirmOpen(false);
    resetMutation.mutate();
  };

  // Check-in handler
  const handleCheckIn = useCallback((habit: Habit) => {
    openCheckInModal(habit.id);
  }, [openCheckInModal]);

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

  return (
    <div className="h-full flex flex-col relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-ambient-growth opacity-30 blur-3xl" />
        <div className="absolute bottom-20 -right-20 h-64 w-64 rounded-full bg-ambient-calm opacity-20 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Habits</h1>
                <p className="mt-1 text-sm text-muted-foreground">Build consistency one day at a time.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setResetConfirmOpen(true)}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button size="sm" variant="growth" onClick={() => createForm.setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Habit
                </Button>
              </div>
            </div>
          </header>

          {/* Check-In Banner */}
          <CheckInBanner
            habits={habits}
            todayCheckIns={todayCheckIns}
            isCheckingInAll={checkInAllMutation.isPending}
            onCheckInAll={() => {
              const checkedIds = new Set(todayCheckIns.map((ci) => ci.habitId));
              const remaining = habits.filter((h) => !checkedIds.has(h.id));
              if (remaining.length > 0) {
                checkInAllMutation.mutate({ habitIds: remaining.map((h) => h.id) });
              }
            }}
          />

          {/* Progress Card */}
          <div className="card-elevated mb-6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-growth" />
                <span className="text-sm font-medium">Today&apos;s Progress</span>
              </div>
              <Badge className={cn(
                "rounded-full",
                completionPct === 100 ? "bg-growth text-growth-foreground" : "bg-secondary"
              )}>
                {completionPct}% complete
              </Badge>
            </div>
            <Progress
              value={completionPct}
              className={cn("h-2 bg-muted", completionPct === 100 && "[&>div]:bg-growth")}
            />
            {completionPct === 100 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-growth">
                <TrendingUp className="h-4 w-4" />
                <span>All habits completed! Keep the momentum going.</span>
              </div>
            )}
          </div>

          {/* Filters */}
          <section className="mb-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Filter:</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug} className="capitalize">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sort:</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                value={sortBy}
                onChange={(e) => {
                  if (e.target.value === "streak" || e.target.value === "name") setSortBy(e.target.value);
                }}
              >
                <option value="streak">Streak</option>
                <option value="name">Name</option>
              </select>
            </div>
          </section>

          {/* Habits List */}
          <section className="grid grid-cols-1 gap-4">
            {visibleHabits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                deleting={deleteConfirm.isDeleting(h.id)}
                onEdit={editForm.openEdit}
                onDelete={deleteConfirm.confirmDelete}
                onCheckIn={handleCheckIn}
              />
            ))}
          </section>

          {/* Habit limit upgrade prompt */}
          {upgradePromptOpen && upgradeSurface === "habit_create_limit" && (
            <div className="mt-4">
              <UpgradePrompt
                surface={upgradeSurface as "habit_create_limit"}
                trigger={upgradeTrigger as "habit_limit"}
                title="Unlock unlimited habits"
                description="You've reached the Free plan habit limit. Upgrade to Pro to build more daily habits."
                isPro={isPro}
                onDismiss={dismissUpgradePrompt}
              />
            </div>
          )}

          {/* Empty State */}
          {visibleHabits.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No habits yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first habit to start checking in daily and building consistency.
              </p>
              <Button
                variant="growth"
                size="sm"
                className="mt-4"
                onClick={() => createForm.setOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Habit
              </Button>
            </div>
          )}
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
          // Pass the form dialog's validated data directly to the mutation.
          // Do NOT round-trip through createForm.setForm + handleCreate —
          // React state updates are async, so handleCreate would read stale
          // state and lose the category the user selected.
          createMutation.mutate(
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
        categories={categories}
      />

      {/* Edit Habit Dialog */}
      <HabitFormDialog
        open={editForm.open}
        title="Edit habit"
        onOpenChange={editForm.setOpen}
        initialValues={editForm.form}
        onSubmit={(vals) => {
          // Pass the form dialog's validated data directly to the mutation
          // (same reason as create — avoid stale state).
          if (editForm.editingId) {
            updateMutation.mutate({
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
        categories={categories}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={deleteConfirm.setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete habit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this habit? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => deleteConfirm.setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
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

      {/* Reset Confirmation */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset today&apos;s habits</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove today&apos;s check-ins for all habits. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetConfirm} disabled={resetMutation.isPending}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
