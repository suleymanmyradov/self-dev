"use client";

import { useState } from "react";
import { BrainIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  useMemoryFacts,
  useAddMemoryFact,
  useForgetMemoryFact,
  useForgetAllMemoryFacts,
} from "@/hooks";
import type { MemoryFactCategory } from "@/api";

const CATEGORIES: { id: MemoryFactCategory; label: string; description: string }[] = [
  { id: "commitment", label: "Commitment", description: "Something you said you would do" },
  { id: "preference", label: "Preference", description: "How you want to be coached" },
  { id: "constraint", label: "Constraint", description: "A durable limit (schedule, health, environment)" },
  { id: "context", label: "Context", description: "Stable background (role, location, family)" },
];

const CATEGORY_LABELS: Record<MemoryFactCategory, string> = {
  commitment: "Commitment",
  preference: "Preference",
  constraint: "Constraint",
  context: "Context",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MemorySection() {
  const { data: facts, isLoading } = useMemoryFacts({ page: 1, limit: 100 });
  const addMutation = useAddMemoryFact();
  const forgetMutation = useForgetMemoryFact();
  const forgetAllMutation = useForgetAllMemoryFacts();

  const [newFact, setNewFact] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryFactCategory>("commitment");
  const [confirmForgetAll, setConfirmForgetAll] = useState(false);

  const handleAdd = async () => {
    const trimmed = newFact.trim();
    if (!trimmed) return;
    try {
      await addMutation.mutateAsync({ fact: trimmed, category: newCategory });
      setNewFact("");
      toast.success("Memory fact added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add memory fact");
    }
  };

  const handleForget = async (id: string) => {
    try {
      await forgetMutation.mutateAsync(id);
      toast.success("Memory fact forgotten");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to forget memory fact");
    }
  };

  const handleForgetAll = async () => {
    try {
      await forgetAllMutation.mutateAsync();
      setConfirmForgetAll(false);
      toast.success("All memory facts forgotten");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to forget all memory facts");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Memory</h1>

      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-start gap-3">
          <BrainIcon className="size-5 shrink-0 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">What the coach remembers about you</p>
            <p className="text-sm text-muted-foreground">
              These are the durable facts your coach uses to personalize guidance — commitments
              you&apos;ve made, preferences, constraints, and context. You can inspect, correct, or
              delete any of them at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Add a new fact */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <h2 className="font-semibold text-sm">Add a memory fact</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Tell your coach something you want it to remember. User-authored facts outrank
          model-extracted ones.
        </p>
        <Textarea
          value={newFact}
          onChange={(e) => setNewFact(e.target.value)}
          placeholder="e.g. I train best in the early morning before work"
          className="min-h-[72px] resize-none"
          maxLength={500}
        />
        <div className="flex items-center gap-3">
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as MemoryFactCategory)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={addMutation.isPending || !newFact.trim()}
          >
            {addMutation.isPending ? "Adding…" : "Add fact"}
          </Button>
        </div>
      </div>

      {/* Fact list */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            Remembered facts{facts ? ` (${facts.length})` : ""}
          </h2>
          {facts && facts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setConfirmForgetAll(true)}
              disabled={forgetAllMutation.isPending}
            >
              Forget all
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : !facts || facts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No memory facts yet. Your coach will learn about you as you converse, or you can add
            one above.
          </p>
        ) : (
          <div className="space-y-2">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className="group flex items-start gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground break-words">{fact.fact}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {CATEGORY_LABELS[fact.category]}
                    </Badge>
                    {fact.userAuthored && (
                      <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                        You
                      </Badge>
                    )}
                    {!fact.userAuthored && fact.confidence < 0.5 && (
                      <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                        Low confidence
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(fact.createdAt)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  onClick={() => handleForget(fact.id)}
                  disabled={forgetMutation.isPending}
                  aria-label="Forget this fact"
                >
                  <TrashIcon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirmForgetAll} onOpenChange={setConfirmForgetAll}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forget all memory facts?</DialogTitle>
            <DialogDescription>
              This permanently deletes every fact your coach has remembered about you. The coach
              will start fresh on the next conversation. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmForgetAll(false)}
              disabled={forgetAllMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleForgetAll}
              disabled={forgetAllMutation.isPending}
            >
              {forgetAllMutation.isPending ? "Forgetting…" : "Yes, forget everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
