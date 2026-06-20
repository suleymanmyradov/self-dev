"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { HabitSchema, type HabitFormValues } from "@/lib/validators/habit";
import type { Category } from "@/api";

export type { HabitFormValues } from "@/lib/validators/habit";

export function HabitFormDialog({
  open,
  title,
  onOpenChange,
  initialValues,
  onSubmit,
  categories = [],
}: {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  initialValues: HabitFormValues;
  onSubmit: (values: HabitFormValues) => void;
  categories?: Category[]; // DB categories (source of truth for the dropdown)
}) {
  const [form, setForm] = useState<HabitFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextForm = initialValues;
    const nextError = null;
    const t = setTimeout(() => {
      setForm(nextForm);
      setError(nextError);
    }, 0);
    return () => clearTimeout(t);
  }, [initialValues, open]);

  const handleSubmit = () => {
    const parsed = HabitSchema.safeParse(form);
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
                      onClick={() => setForm((f) => ({ ...f, category: c.slug }))}
                      className="capitalize"
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
