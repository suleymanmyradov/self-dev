"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { useGoals } from "@/store/goals";
import { articles } from "@/lib/articles";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function GoalsPage() {
  const { goals, add, update, remove, toggle, hasHydrated } = useGoals();
  const [seeded, setSeeded] = useState(false);

  // Seed demo data after hydration only, and only once
  useEffect(() => {
    if (!hasHydrated || seeded) return;
    if (goals.length === 0) {
      setSeeded(true);
      // Add goals sequentially with small delays to ensure unique IDs
      setTimeout(() => add({ title: "Run 5K in under 30 minutes", description: "Build endurance with 3x weekly runs.", category: "health", progress: 25 }), 0);
      setTimeout(() => add({ title: "Read 12 books this year", description: "One book per month; take notes.", category: "productivity", progress: 40 }), 10);
      setTimeout(() => add({ title: "Daily meditation", description: "5-10 minutes to reduce stress.", category: "mindfulness", progress: 60 }), 20);
    }
  }, [hasHydrated, seeded, goals.length, add]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ title: string; description: string; category: string; dueDate?: string }>({
    title: "",
    description: "",
    category: "productivity",
  });

  const filteredArticles = useMemo(() => {
    // Recommend 3 most relevant by category of first goal (simple heuristic for now)
    const cat = goals[0]?.category;
    const list = cat ? articles.filter((a) => a.category === cat) : articles;
    return list.slice(0, 3);
  }, [goals]);

  if (!hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading goals...</div>
    );
  }

  const completion = goals.length ? Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
              <p className="text-sm text-muted-foreground">Set outcomes, get recommendations, and connect habits.</p>
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
                      <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Category</label>
                      <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">Due date</label>
                      <Input type="date" value={form.dueDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => { add({ title: form.title, description: form.description, category: form.category, dueDate: form.dueDate, progress: 0 }); setOpen(false); setForm({ title: "", description: "", category: "productivity" }); }}>Create</Button>
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
              <Badge variant="secondary" className="rounded-full">{completion}%</Badge>
            </div>
            <Progress value={completion} className="h-2" />
          </section>

          <Separator className="my-4" />

          <section className="grid grid-cols-1 gap-3">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} onToggle={toggle} onEdit={(goal) => update(goal.id, goal)} onDelete={remove} />
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
            Tip: You can link habits to goals later to track the small daily actions that ladder up to your outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}
