"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Link2 } from "lucide-react";
import type { GoalFormValues } from "@/lib/validators/goal";
import type { Category, Habit } from "@/api";
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
  }) => void;
  categories?: Category[]; // DB categories (source of truth for the dropdown)
  habits?: Habit[]; // User's habits to link to the goal
};

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
  const { form, error, setTitle, setDescription, setCategory, setDueDate, setProgress, toggleHabitId, reset, validate } =
    useGoalForm(initialValues);

  // Reset form when dialog opens with new initial values
  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

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
          {/* Linked habits */}
          <div className="grid gap-1.5">
            <div className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <label className="text-sm font-medium">Linked habits</label>
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
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-1">
                {habits.map((h) => {
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
            )}
          </div>
          {mode === "edit" && onProgressChange && (
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
              />
              <Progress value={form.progress ?? 0} className="h-2" />
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
          <Button variant={mode === "create" ? "energy" : "default"} onClick={handleSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
