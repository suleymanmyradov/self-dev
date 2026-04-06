"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HABIT_CATEGORIES } from "@/lib/constants";
import { Plus, RotateCcw, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useToggleHabit,
  useResetTodayHabits,
  useHabitFilters,
  useHabitForm,
  useHabitEditForm,
  useConfirmDelete,
} from "@/hooks";

export default function HabitsPage() {
  // Fetch habits
  const { data: habits = [], isLoading } = useHabits({ page: 1, limit: 100 });

  // Mutations
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const deleteMutation = useDeleteHabit();
  const toggleMutation = useToggleHabit();
  const resetMutation = useResetTodayHabits();

  // Filters
  const { categoryFilter, setCategoryFilter, sortBy, setSortBy, visibleHabits, completionPct } = 
    useHabitFilters(habits);

  // Create form
  const createForm = useHabitForm();
  const handleCreate = () => {
    const validated = createForm.validate();
    if (validated) {
      createMutation.mutate({
        name: validated.name.trim(),
        description: validated.description.trim(),
        category: validated.category,
      });
      createForm.reset();
    }
  };

  // Edit form
  const editForm = useHabitEditForm();
  const handleEdit = () => {
    const validated = editForm.validate();
    if (validated && editForm.editingId) {
      updateMutation.mutate({
        id: editForm.editingId,
        data: {
          name: validated.name.trim(),
          description: validated.description.trim(),
          category: validated.category,
        },
      });
      editForm.reset();
    }
  };

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

  // Loading state
  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading habits...</div>;
  }

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
                <p className="mt-1 text-sm text-muted-foreground">Small steps, lasting change.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => resetMutation.mutate()}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button size="sm" variant="growth" onClick={() => createForm.setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Habit
                </Button>
              </div>
            </div>
          </header>

          {/* Progress Card */}
          <div className="card-elevated mb-6 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-growth" />
                <span className="text-sm font-medium">Today's Progress</span>
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
                {HABIT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
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
                onToggle={(id) => toggleMutation.mutate(id)}
                onEdit={editForm.openEdit}
                onDelete={deleteConfirm.confirmDelete}
              />
            ))}
          </section>
        </div>
      </div>

      {/* Create Habit Dialog */}
      <HabitFormDialog
        open={createForm.open}
        title="New habit"
        onOpenChange={createForm.setOpen}
        initialValues={createForm.form}
        onSubmit={(vals) => { createForm.setForm(vals); handleCreate(); }}
      />

      {/* Edit Habit Dialog */}
      <HabitFormDialog
        open={editForm.open}
        title="Edit habit"
        onOpenChange={editForm.setOpen}
        initialValues={editForm.form}
        onSubmit={(vals) => { editForm.setForm({ ...editForm.form, ...vals }); handleEdit(); }}
        showAdvanced
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
    </div>
  );
}
