"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { GOAL_CATEGORIES } from "@/lib/constants";
import type { GoalFormValues } from "@/lib/validators/goal";
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
    category: GoalFormValues["category"];
    dueDate?: string;
  }) => void;
};

export function GoalFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  onProgressChange,
  onSubmit,
}: GoalFormDialogProps) {
  const { form, error, setTitle, setDescription, setCategory, setDueDate, setProgress, reset, validate } =
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
            <label htmlFor="goal-category" className="text-sm font-medium">Category</label>
            <select
              id="goal-category"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
              value={form.category}
              onChange={(e) => setCategory(e.target.value as GoalFormValues["category"])}
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
              onChange={(e) => setDueDate(e.target.value || undefined)}
            />
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
