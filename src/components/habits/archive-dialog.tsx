"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Habit, Goal } from "@/api";

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "habit" | "goal";
  habits?: Habit[];
  goals?: Goal[];
  onDeleteHabit?: (id: string) => void;
  onDeleteGoal?: (id: string) => void;
}

export function ArchiveDialog({
  open,
  onOpenChange,
  mode,
  habits = [],
  goals = [],
  onDeleteHabit,
  onDeleteGoal,
}: ArchiveDialogProps) {
  const items =
    mode === "habit"
      ? habits.map((h) => ({ id: h.id, label: h.name, sub: h.category || "uncategorized" }))
      : goals.map((g) => ({ id: g.id, label: g.title, sub: g.category || "uncategorized" }));

  const handleDelete = (id: string) => {
    if (mode === "habit") {
      onDeleteHabit?.(id);
    } else {
      onDeleteGoal?.(id);
    }
    // Close after deleting one — the limit is resolved and the user can retry.
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "habit" ? "Archive a habit" : "Archive a goal"}
          </DialogTitle>
          <DialogDescription>
            {mode === "habit"
              ? "Delete a habit to make room for a new one. This frees up a slot on your Free plan."
              : "Delete a goal to make room for a new one. This frees up a slot on your Free plan."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5 py-2 max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nothing to archive yet.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground capitalize">{item.sub}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                  aria-label={`Delete ${item.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
