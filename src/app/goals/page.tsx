"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { articles } from "@/lib/articles";
import { GOAL_CATEGORIES } from "@/lib/constants";
import { CreateGoalSchema, type GoalFormValues } from "@/lib/validators/goal";
import type { Goal } from "@/api/growthapiComponents";
import {
  listGoals,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  toggleGoal as apiToggleGoal,
} from "@/api/growthapi";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => listGoals({ page: 1, limit: 100 }),
  });

  const goals = data?.data ?? [];

  const createGoalMutation = useMutation({
    mutationFn: apiCreateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof apiUpdateGoal>[0] }) =>
      apiUpdateGoal(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => apiDeleteGoal({}, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: (id: string) => apiToggleGoal({}, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GoalFormValues>({
    title: "",
    description: "",
    category: "productivity",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<GoalFormValues & { progress: number }>({
    title: "",
    description: "",
    category: "productivity",
    progress: 0,
  });

  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const filteredArticles = useMemo(() => {
    const cat = goals[0]?.category;
    const list = cat ? articles.filter((a) => a.category === cat) : articles;
    return list.slice(0, 3);
  }, [goals]);

  const createGoal = () => {
    const parsed = CreateGoalSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    createGoalMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      dueDate: form.dueDate,
    });
    setOpen(false);
    setForm({ title: "", description: "", category: "productivity" });
    setFormError(null);
  };

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditForm({
      title: goal.title,
      description: goal.description,
      category: goal.category as GoalFormValues["category"],
      dueDate: goal.dueDate,
      progress: goal.progress,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (editingId) {
      updateGoalMutation.mutate({
        id: editingId,
        payload: {
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category,
          dueDate: editForm.dueDate,
        },
      });
    }
    setEditOpen(false);
  };

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
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
              <p className="text-sm text-muted-foreground">
                Set outcomes, get recommendations, and connect habits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>New goal</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-2">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        className="rounded-md border bg-background px-2 py-1.5 text-sm"
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as GoalFormValues["category"] }))}
                      >
                        {GOAL_CATEGORIES.map((c) => (
                          <option key={c} value={c} className="capitalize">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Due date</label>
                      <Input
                        type="date"
                        value={form.dueDate ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                      />
                    </div>
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createGoal}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="default" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Goal
              </Button>
            </div>
          </header>

          <section className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall completion</span>
              <Badge variant="secondary" className="rounded-full">
                {completion}%
              </Badge>
            </div>
            <Progress value={completion} className="h-2" />
          </section>

          <Separator className="my-4" />

          <section className="grid grid-cols-1 gap-3">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                deleting={deletingIds.has(g.id)}
                onToggle={(id) => toggleGoalMutation.mutate(id)}
                onEdit={openEdit}
                onDelete={(id) => {
                  setConfirmDeleteId(id);
                  setConfirmOpen(true);
                }}
              />
            ))}
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-lg font-semibold">Recommended articles</h2>
            <p className="text-sm text-muted-foreground">Based on your goals, these may help:</p>
            <ul className="mt-3 space-y-2">
              {filteredArticles.map((a) => (
                <li key={a.id} className="text-sm">
                  <Link href={`/article/${a.id}`} className="underline-offset-2 hover:underline">
                    {a.title}
                  </Link>
                  <span className="ml-2 text-muted-foreground">· {a.category}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6 text-xs text-muted-foreground">
            Tip: You can link habits to goals later to track the small daily actions that ladder up
            to your outcomes.
          </div>
        </div>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Category</label>
              <select
                className="rounded-md border bg-background px-2 py-1.5 text-sm"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, category: e.target.value as GoalFormValues["category"] }))
                }
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={editForm.dueDate ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete goal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  setDeletingIds((prev) => new Set(prev).add(confirmDeleteId));
                  setConfirmOpen(false);
                  const toRemove = confirmDeleteId;
                  deleteGoalMutation.mutate(toRemove, {
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
