"use client";

import { use, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { listArticles } from "@/api";
import { useBillingUIStore } from "@/store/billing-ui";
import { useShallow } from "zustand/react/shallow";

const GoalFormDialog = dynamic(() => import("@/components/goals/goal-form-dialog").then((mod) => mod.GoalFormDialog));
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useToggleGoal, useUpdateGoalProgress, useConfirmDelete, useBillingOverview } from "@/hooks";
import type { Goal, GoalsResponse } from "@/api";
import Link from "next/link";
import { Plus, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEntitlements, useTrackUpgradeEvent } from "@/hooks";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

interface GoalsClientProps {
  goalsPromise: Promise<GoalsResponse>;
}

export function GoalsClient({ goalsPromise }: GoalsClientProps) {
  const goalsData = use(goalsPromise);
  const { data: goals = [] } = useGoals(goalsData);

  const { data: entitlements } = useEntitlements();
  const { data: billing } = useBillingOverview();
  const isPro = billing?.subscription?.planCode === "pro";
  const trackUpgradeEvent = useTrackUpgradeEvent();

  const { data: articlesData } = useQuery({
    queryKey: ["articles", "recommended"],
    queryFn: () => listArticles({ limit: 3 }),
    enabled: goals.length > 0,
  });

  const articles = articlesData?.data ?? [];

  // Mutations
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();
  const toggleMutation = useToggleGoal();
  const updateProgressMutation = useUpdateGoalProgress();

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

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Delete confirmation
  const deleteConfirm = useConfirmDelete<string>();

  const handleCreate = useCallback(
    (validated: { title: string; description: string; category: string; dueDate?: string }) => {
      // Check entitlement before creating
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
      createMutation.mutate({ ...validated, category: validated.category as import("@/api").GoalCategory }, {
        onSuccess: () => {
          setCreateOpen(false);
        },
        onError: (error: unknown) => {
          // Check for plan limit error from backend
          const err = error as { data?: { code?: string } };
          if (err?.data?.code === "plan_limit_reached") {
            showUpgradePrompt("goal_create_limit", "goal_limit");
          }
        },
      });
    },
    [entitlements, showUpgradePrompt, trackUpgradeEvent, createMutation]
  );

  const openEdit = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setEditOpen(true);
  }, []);

  const handleSaveEdit = useCallback(
    (validated: { title: string; description: string; category: string; dueDate?: string }) => {
      if (!editingGoal) return;
      updateMutation.mutate(
        { id: editingGoal.id, data: { ...validated, category: validated.category as import("@/api").GoalCategory } },
        { onSuccess: () => setEditOpen(false) }
      );
    },
    [editingGoal, updateMutation]
  );

  const handleProgressChange = useCallback(
    (progress: number) => {
      if (!editingGoal) return;
      updateProgressMutation.mutate({ id: editingGoal.id, progress });
    },
    [editingGoal, updateProgressMutation]
  );

  const handleCardProgressChange = useCallback((id: string, progress: number) => {
    updateProgressMutation.mutate({ id, progress });
  }, [updateProgressMutation]);

  const handleToggleGoal = useCallback((id: string) => {
    toggleMutation.mutate(id);
  }, [toggleMutation]);

  const handleDelete = () => {
    const id = deleteConfirm.startDeleting();
    if (id) {
      deleteMutation.mutate(id, {
        onSettled: () => deleteConfirm.stopDeleting(id),
      });
    }
  };

  const completion = goals.length
    ? Math.round((goals.filter((g) => g.completed).length / goals.length) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-ambient-energy opacity-25 blur-3xl" />
        <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-ambient-growth opacity-30 blur-3xl" />
      </div>

      <div className="relative flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Goals</h1>
                <p className="mt-1 text-sm text-muted-foreground">Turn intentions into a plan you can act on daily.</p>
              </div>
              <Button size="sm" variant="energy" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Goal
              </Button>
            </div>
          </header>

          {/* Progress Card */}
          <div className="card-elevated mb-6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-energy" />
                <span className="text-sm font-medium">Overall Progress</span>
              </div>
              <Badge
                className={cn(
                  "rounded-full",
                  completion === 100 ? "bg-growth text-growth-foreground" : "bg-secondary"
                )}
              >
                {completion}% complete
              </Badge>
            </div>
            <Progress
              value={completion}
              className={cn("h-2 bg-muted", completion === 100 && "[&>div]:bg-growth")}
            />
            {completion === 100 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-growth">
                <Trophy className="h-4 w-4" />
                <span>All goals achieved! Time to set new challenges.</span>
              </div>
            )}
          </div>

          {/* Goals List */}
          <section className="grid grid-cols-1 gap-4">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                deleting={deleteConfirm.isDeleting(g.id)}
                onToggle={handleToggleGoal}
                onEdit={openEdit}
                onDelete={deleteConfirm.confirmDelete}
                onProgressChange={handleCardProgressChange}
              />
            ))}
          </section>

          {/* Empty State */}
          {goals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No goals yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first goal to start turning intentions into actionable plans.
              </p>
              <Button
                variant="energy"
                size="sm"
                className="mt-4"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Goal
              </Button>
            </div>
          )}

          {/* Goal limit upgrade prompt */}
          {upgradePromptOpen && upgradeSurface === "goal_create_limit" && (
            <div className="mt-4">
              <UpgradePrompt
                surface={upgradeSurface as "goal_create_limit"}
                trigger={upgradeTrigger as "goal_limit"}
                title="Unlock unlimited goals"
                description="You've reached the Free plan goal limit. Upgrade to Pro to track as many goals as you need."
                isPro={isPro}
                onDismiss={dismissUpgradePrompt}
              />
            </div>
          )}

          {/* Recommended Articles */}
          {articles.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Recommended Reading</h2>
              <p className="text-sm text-muted-foreground">Articles to help you achieve your goals:</p>
              <ul className="mt-3 space-y-2">
                {articles.map((a) => (
                  <li key={a.id} className="text-sm">
                    <Link href={`/article/${a.id}`} className="underline-offset-2 hover:underline">
                      {a.title}
                    </Link>
                    <span className="ml-2 text-muted-foreground">· {a.category?.name ?? 'Uncategorized'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Tip: Link habits to your goals to turn big outcomes into small daily actions your coach can track.
          </p>
        </div>
      </div>

      {/* Create Dialog */}
      <GoalFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <GoalFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialValues={editingGoal ? {
          title: editingGoal.title,
          description: editingGoal.description,
          category: editingGoal.category,
          dueDate: editingGoal.dueDate,
          progress: editingGoal.progress,
        } : undefined}
        onProgressChange={handleProgressChange}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={deleteConfirm.setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete goal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => deleteConfirm.setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
