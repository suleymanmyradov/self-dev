"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { z } from "zod";

export type HabitFormValues = {
  name: string;
  description: string;
  category: string;
  streak?: number;
  completed?: boolean;
};

const HabitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
  category: z.string().min(2, "Category is required"),
  streak: z.number().optional(),
  completed: z.boolean().optional(),
});

export function HabitFormDialog({
  open,
  title,
  onOpenChange,
  initialValues,
  onSubmit,
  showAdvanced = false,
}: {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  initialValues: HabitFormValues;
  onSubmit: (values: HabitFormValues) => void;
  showAdvanced?: boolean; // show streak/completed for edit
}) {
  const [form, setForm] = useState<HabitFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialValues);
    setError(null);
  }, [initialValues, open]);

  const handleSubmit = () => {
    const parsed = HabitSchema.safeParse({
      ...form,
      streak: form.streak ?? 0,
      completed: form.completed ?? false,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g., Read 10 pages"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Optional details"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Category</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {form.category}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {["productivity", "health", "mindfulness"].map((c) => (
                  <DropdownMenuItem key={c} onClick={() => setForm((f) => ({ ...f, category: c }))}>
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showAdvanced && (
            <>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Streak</label>
                <Input
                  type="number"
                  min={0}
                  value={form.streak ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, streak: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="form-completed"
                  type="checkbox"
                  checked={!!form.completed}
                  onChange={(e) => setForm((f) => ({ ...f, completed: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="form-completed" className="text-sm">
                  Completed today
                </label>
              </div>
            </>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
