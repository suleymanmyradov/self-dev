"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Habit } from "@/lib/types-data";
import { Plus, RotateCcw } from "lucide-react";
import { z } from "zod";
import { useHabits } from "@/store/habits";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitFormDialog, type HabitFormValues } from "@/components/habits/habit-form-dialog";

export default function HabitsPage() {
  const { habits, add, toggle, update, remove, resetToday, hasHydrated } = useHabits();

  // Seed demo data if empty (after hydration only)
  useEffect(() => {
    if (!hasHydrated) return;
    if (habits.length === 0) {
      add({ name: "Morning Walk", description: "15-minute walk to start the day fresh", category: "health", completed: false, streak: 4 });
      add({ name: "Read 10 pages", description: "Focus on non-fiction personal growth", category: "productivity", completed: true, streak: 12 });
      add({ name: "Meditate", description: "5–10 minutes of mindfulness", category: "mindfulness", completed: false, streak: 2 });
    }
  }, [hasHydrated, habits.length, add]);

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

  // New Habit dialog & validation
  const NewHabitSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    category: z.string().min(2, "Category is required"),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HabitFormValues>({ name: "", description: "", category: "productivity" });

  const createHabit = () => {
    const parsed = NewHabitSchema.safeParse(form);
    if (!parsed.success) {
      // handled in HabitFormDialog locally; keep as safety no-op here
      return;
    }
    add({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      completed: false,
      streak: 0,
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
    setEditForm({ name: h.name, description: h.description, category: h.category, streak: h.streak, completed: h.completed });
    setEditOpen(true);
  };

  const saveEdit = () => {
    const parsed = NewHabitSchema.safeParse(editForm);
    if (!parsed.success) {
      return;
    }
    if (editingId) {
      update(editingId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        streak: Math.max(0, Math.floor(Number(editForm.streak) || 0)),
        completed: !!editForm.completed,
      });
    }
    setEditOpen(false);
  };

  if (!hasHydrated) {
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
          <Button variant="outline" size="sm" onClick={resetToday}>
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
            <option value="productivity">Productivity</option>
            <option value="health">Health</option>
            <option value="mindfulness">Mindfulness</option>
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
            onToggle={toggle}
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
                  setTimeout(() => {
                    remove(toRemove);
                    setDeletingIds((prev) => {
                      const s = new Set(prev);
                      s.delete(toRemove);
                      return s;
                    });
                  }, 200);
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
