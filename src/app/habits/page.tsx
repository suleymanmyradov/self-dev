"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Habit } from "@/api/growthapiComponents";
import {
  listHabits,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabit as apiToggleHabit,
  resetTodayHabits as apiResetTodayHabits,
} from "@/api/growthapi";
import { HABIT_CATEGORIES } from "@/lib/constants";
import { CreateHabitSchema, type HabitFormValues } from "@/lib/validators/habit";
import { Plus, RotateCcw } from "lucide-react";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: () => listHabits({ page: 1, limit: 100 }),
  });

  const habits = data?.data ?? [];

  const createHabitMutation = useMutation({
    mutationFn: apiCreateHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof apiUpdateHabit>[0] }) =>
      apiUpdateHabit(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: string) => apiDeleteHabit({}, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: (id: string) => apiToggleHabit({}, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const resetTodayMutation = useMutation({
    mutationFn: apiResetTodayHabits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const completionPct = useMemo(() => {
    if (habits.length === 0) return 0;
    const done = habits.filter((h) => h.completed).length;
    return Math.round((done / habits.length) * 100);
  }, [habits]);

  // Filter & sort controls
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"streak" | "name">("streak");

  const visibleHabits = useMemo(() => {
    const filtered = categoryFilter === "all" ? habits : habits.filter(h => h.category === categoryFilter);
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "streak") return b.streak - a.streak;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [habits, categoryFilter, sortBy]);

  // New Habit dialog
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HabitFormValues>({ name: "", description: "", category: "productivity" });

  const createHabit = () => {
    const parsed = CreateHabitSchema.safeParse(form);
    if (!parsed.success) {
      return;
    }
    createHabitMutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
    });
    setOpen(false);
    setForm({ name: "", description: "", category: "productivity" });
  };

  // Edit Habit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HabitFormValues & { streak: number; completed: boolean }>({
    name: "",
    description: "",
    category: "productivity",
    streak: 0,
    completed: false,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const openEdit = (h: Habit) => {
    setEditingId(h.id);
    setEditForm({
      name: h.name,
      description: h.description,
      category: h.category as HabitFormValues["category"],
      streak: h.streak,
      completed: h.completed,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    const parsed = CreateHabitSchema.safeParse(editForm);
    if (!parsed.success) {
      return;
    }
    if (editingId) {
      updateHabitMutation.mutate({
        id: editingId,
        payload: {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          category: editForm.category,
        },
      });
    }
    setEditOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Loading habits...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
              <p className="text-sm text-muted-foreground">Track, build, and maintain small wins every day.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => resetTodayMutation.mutate()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Today
              </Button>
              <HabitFormDialog
                open={open}
                title="Create a new habit"
                onOpenChange={setOpen}
                initialValues={form}
                onSubmit={(vals) => { setForm(vals); createHabit(); }}
              />
              <Button size="sm" variant="default" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Habit
              </Button>
            </div>
          </header>

          {/* Filters */}
          <section className="mb-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Filter:</span>
              <select
                className="rounded-md border bg-background px-2 py-1"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All</option>
                {HABIT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sort:</span>
              <select
                className="rounded-md border bg-background px-2 py-1"
                value={sortBy}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "streak" || value === "name") {
                    setSortBy(value);
                  }
                }}
              >
                <option value="streak">Streak</option>
                <option value="name">Name</option>
              </select>
            </div>
          </section>

          <section className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Today</span>
              <Badge variant="secondary" className="rounded-full">{completionPct}% complete</Badge>
            </div>
            <Progress value={completionPct} className="h-2" />
          </section>

          <Separator className="my-4" />

          <section className="grid grid-cols-1 gap-3">
            {visibleHabits.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                deleting={deletingIds.has(h.id)}
                onToggle={(id) => toggleHabitMutation.mutate(id)}
                onEdit={openEdit}
                onDelete={(id) => { setConfirmDeleteId(id); setConfirmOpen(true); }}
              />
            ))}
          </section>
        </div>
      </div>
      {/* Edit Habit Dialog */}
      <HabitFormDialog
        open={editOpen}
        title="Edit habit"
        onOpenChange={setEditOpen}
        initialValues={editForm}
        onSubmit={(vals) => { setEditForm({ ...editForm, ...vals }); saveEdit(); }}
        showAdvanced
      />

      {/* Delete Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete habit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this habit? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  setDeletingIds((prev) => new Set(prev).add(confirmDeleteId));
                  setConfirmOpen(false);
                  const toRemove = confirmDeleteId;
                  deleteHabitMutation.mutate(toRemove, {
                    onSettled: () => {
                      setDeletingIds((prev) => {
                        const s = new Set(prev);
                        s.delete(toRemove);
                        return s;
                      });
                    },
                  });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
