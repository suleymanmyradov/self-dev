"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { listArticles } from "@/api";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useToggleGoal, useUpdateGoalProgress, useGoalForm, useConfirmDelete } from "@/hooks";
import type { Goal } from "@/api";
import Link from "next/link";
import { Plus, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  // Data fetching
  const { data: goals = [], isLoading } = useGoals();

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

  // Create form
  const createForm = useGoalForm();
  const [createOpen, setCreateOpen] = useState(false);

  // Edit form
  const editForm = useGoalForm();
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation
  const deleteConfirm = useConfirmDelete<string>();

  // Handlers
  const handleCreate = () => {
    const validated = createForm.validate();
    if (!validated) return;
    createMutation.mutate(validated, {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id);
    editForm.loadGoal(goal);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const validated = editForm.validate();
    if (!validated) return;
    updateMutation.mutate(
      { id: editingId, data: validated },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const handleProgressChange = (progress: number) => {
    if (!editingId) return;
    editForm.setProgress(progress);
    updateProgressMutation.mutate({ id: editingId, progress });
  };

  const handleCardProgressChange = (id: string, progress: number) => {
    updateProgressMutation.mutate({ id, progress });
  };

  const handleDelete = () => {
    const id = deleteConfirm.startDeleting();
    if (id) {
      deleteMutation.mutate(id, {
        onSettled: () => deleteConfirm.stopDeleting(id),
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Loading goals...
      </div>
    );
  }

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
                <p className="mt-1 text-sm text-muted-foreground">Set outcomes, track progress, achieve growth.</p>
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
                onToggle={(id) => toggleMutation.mutate(id)}
                onEdit={openEdit}
                onDelete={deleteConfirm.confirmDelete}
                onProgressChange={handleCardProgressChange}
              />
            ))}
          </section>

          {/* Recommended Articles */}
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

          <p className="mt-6 text-xs text-muted-foreground">
            Tip: You can link habits to goals later to track the small daily actions that ladder up
            to your outcomes.
          </p>
        </div>
      </div>

      {/* Create Dialog */}
      <GoalFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        form={createForm.form}
        error={createForm.error}
        onTitleChange={createForm.setTitle}
        onDescriptionChange={createForm.setDescription}
        onCategoryChange={createForm.setCategory}
        onDueDateChange={createForm.setDueDate}
        onSubmit={handleCreate}
      />

      {/* Edit Dialog */}
      <GoalFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        form={editForm.form}
        error={editForm.error}
        onTitleChange={editForm.setTitle}
        onDescriptionChange={editForm.setDescription}
        onCategoryChange={editForm.setCategory}
        onDueDateChange={editForm.setDueDate}
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
