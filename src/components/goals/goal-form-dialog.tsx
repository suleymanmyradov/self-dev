"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Link2, Search, X } from "lucide-react";
import type { GoalFormValues } from "@/lib/validators/goal";
import type { Category, Habit, GoalMeasurement } from "@/api";
import { useGoalForm } from "@/hooks";

export type GoalFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: Partial<GoalFormValues>;
  onProgressChange?: (progress: number) => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    dueDate?: string;
    relatedHabitIds: string[];
    measurement?: GoalMeasurement;
    startValue?: number;
    currentValue?: number;
    targetValue?: number;
    unit?: string;
    milestones?: { id?: string; title: string }[];
  }) => void;
  categories?: Category[]; // DB categories (source of truth for the dropdown)
  habits?: Habit[]; // User's habits to link to the goal
};

const MEASUREMENT_OPTIONS: { value: GoalMeasurement; label: string; hint: string }[] = [
  { value: "manual", label: "Manual", hint: "Set progress yourself with a slider" },
  { value: "binary", label: "Done / Not done", hint: "Just mark it complete" },
  { value: "numeric", label: "Numeric target", hint: "Track a value toward a goal" },
  { value: "milestone", label: "Milestones", hint: "Break it into steps" },
  { value: "habit", label: "Habit-based", hint: "Progress from linked habit check-ins" },
];

export function GoalFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  onProgressChange,
  onSubmit,
  categories = [],
  habits = [],
}: GoalFormDialogProps) {
  const {
    form, error, setTitle, setDescription, setCategory, setDueDate, setProgress,
    setMeasurement, setStartValue, setCurrentValue, setTargetValue, setUnit, setMilestones,
    toggleHabitId, reset, validate,
  } = useGoalForm(initialValues);

  const measurement = form.measurement ?? "manual";

  // Linked-habit picker: client-side search + incremental "show more".
  // All habits are already loaded by the parent (useHabits fetches every page),
  // so this is purely a rendering concern for users with many habits.
  const HABIT_PAGE_SIZE = 20;
  const [habitQuery, setHabitQuery] = useState("");
  const [habitVisible, setHabitVisible] = useState(HABIT_PAGE_SIZE);

  // Reset form only when the dialog opens (false -> true), not on every
  // initialValues change while open. The parent rebuilds initialValues as an
  // inline object each render, so resetting on every change would clobber
  // in-progress edits (e.g. progress slider) whenever the parent re-renders.
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      reset(initialValues);
      setHabitQuery("");
      setHabitVisible(HABIT_PAGE_SIZE);
    }
    prevOpenRef.current = open;
  }, [open, initialValues, reset]);

  const filteredHabits = useMemo(() => {
    const q = habitQuery.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
    );
  }, [habits, habitQuery]);

  const handleHabitSearchChange = useCallback((value: string) => {
    setHabitQuery(value);
    setHabitVisible(HABIT_PAGE_SIZE);
  }, []);

  const visibleHabits = filteredHabits.slice(0, habitVisible);
  const hasMoreHabits = filteredHabits.length > habitVisible;

  const handleSubmit = useCallback(() => {
    const validated = validate();
    if (validated) {
      onSubmit(validated);
    }
  }, [validate, onSubmit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New goal" : "Edit goal"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Category</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between capitalize">
                  {form.category || "Select a category"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.length === 0 ? (
                  <DropdownMenuItem disabled>Loading categories…</DropdownMenuItem>
                ) : (
                  categories.map((c) => (
                    <DropdownMenuItem
                      key={c.slug}
                      onClick={() => setCategory(c.slug)}
                      className="capitalize"
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Due date</label>
            <Input
              type="date"
              value={form.dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value || undefined)}
            />
          </div>
          {/* Measurement type picker */}
          <div className="grid gap-1">
            <label className="text-sm font-medium">How do you want to measure progress?</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {MEASUREMENT_OPTIONS.find((o) => o.value === measurement)?.label ?? "Manual"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {MEASUREMENT_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() => setMeasurement(o.value)}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="font-medium">{o.label}</span>
                    <span className="text-xs text-muted-foreground">{o.hint}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Numeric target inputs */}
          {measurement === "numeric" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="grid gap-1">
                <label className="text-xs font-medium text-muted-foreground">Start</label>
                <Input
                  type="number"
                  value={form.startValue ?? 0}
                  onChange={(e) => setStartValue(Number(e.target.value))}
                />
              </div>
              {mode === "edit" && (
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Current</label>
                  <Input
                    type="number"
                    value={form.currentValue ?? 0}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                  />
                </div>
              )}
              <div className={mode === "edit" ? "grid gap-1" : "col-span-2 grid gap-1"}>
                <label className="text-xs font-medium text-muted-foreground">Target</label>
                <Input
                  type="number"
                  value={form.targetValue ?? 0}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                />
              </div>
              <div className="col-span-3 grid gap-1">
                <label className="text-xs font-medium text-muted-foreground">Unit (e.g. kg, $, pages)</label>
                <Input
                  type="text"
                  value={form.unit ?? ""}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="kg"
                />
              </div>
            </div>
          )}
          {/* Milestone steps editor */}
          {measurement === "milestone" && (
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Milestone steps</label>
              {(form.milestones ?? []).map((ms, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={ms.title}
                    onChange={(e) => {
                      const next = [...(form.milestones ?? [])];
                      next[i] = { ...next[i], title: e.target.value };
                      setMilestones(next);
                    }}
                    placeholder={`Step ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      const next = [...(form.milestones ?? [])];
                      next.splice(i, 1);
                      setMilestones(next);
                    }}
                    aria-label="Remove step"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMilestones([...(form.milestones ?? []), { id: undefined, title: "" }])}
              >
                Add step
              </Button>
            </div>
          )}
          {/* Linked habits — shown for habit and manual types */}
          {(measurement === "habit" || measurement === "manual") && (
          <div className="grid gap-1.5">
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-sm font-medium">
                {measurement === "habit" ? "Linked habits (required)" : "Linked habits"}
              </label>
              {(form.relatedHabitIds?.length ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {form.relatedHabitIds!.length} selected
                </span>
              )}
            </div>
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No habits yet. Create habits first to link them to this goal.
              </p>
            ) : (
              <div className="grid gap-1.5">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={habitQuery}
                    onChange={(e) => handleHabitSearchChange(e.target.value)}
                    placeholder="Search habits…"
                    className="h-8 pl-7 pr-7 text-sm"
                  />
                  {habitQuery && (
                    <button
                      type="button"
                      onClick={() => handleHabitSearchChange("")}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {filteredHabits.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-1">
                    No habits match “{habitQuery}”.
                  </p>
                ) : (
                  <>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-1">
                      {visibleHabits.map((h) => {
                        const checked = form.relatedHabitIds?.includes(h.id) ?? false;
                        return (
                          <label
                            key={h.id}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleHabitId(h.id)}
                              aria-label={`Link habit ${h.name}`}
                            />
                            <span className="truncate">{h.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {hasMoreHabits && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHabitVisible((v) => v + HABIT_PAGE_SIZE)}
                        className="w-full text-xs text-muted-foreground"
                      >
                        Show more ({filteredHabits.length - habitVisible} hidden)
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          )}
          {mode === "edit" && onProgressChange && measurement === "manual" && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Progress</label>
                <span className="text-sm font-medium tabular-nums">{form.progress ?? 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.progress ?? 0}
                onChange={(e) => {
                  const progress = Number(e.target.value);
                  setProgress(progress);
                  onProgressChange(progress);
                }}
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${form.progress ?? 0}%, var(--muted) ${form.progress ?? 0}%, var(--muted) 100%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
              />
              <div className="flex gap-2">
                {[0, 25, 50, 75, 100].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProgress(preset);
                      onProgressChange(preset);
                    }}
                    className={(form.progress ?? 0) === preset ? "border-primary" : ""}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={mode === "create" ? "success" : "default"} onClick={handleSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
