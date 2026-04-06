"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GOAL_CATEGORIES } from "@/lib/constants";
import type { GoalFormValues } from "@/lib/validators/goal";

export type GoalFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  form: GoalFormValues;
  error: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (category: GoalFormValues["category"]) => void;
  onDueDateChange: (dueDate: string | undefined) => void;
  onSubmit: () => void;
};

export function GoalFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  error,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDueDateChange,
  onSubmit,
}: GoalFormDialogProps) {
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
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Category</label>
            <select
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              value={form.category}
              onChange={(e) => onCategoryChange(e.target.value as GoalFormValues["category"])}
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
              onChange={(e) => onDueDateChange(e.target.value || undefined)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={mode === "create" ? "energy" : "default"} onClick={onSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
