"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Habit } from "@/api/growthapiComponents";
import { Check, Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type HabitCardProps = {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
};

export function HabitCard({ habit: h, onToggle, onEdit, onDelete, deleting }: HabitCardProps) {
  return (
    <Card
      data-deleting={deleting || undefined}
      className="p-4 transition-all duration-200 data-[deleting=true]:opacity-0 data-[deleting=true]:-translate-y-1 data-[deleting=true]:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs",
            h.completed ? "border-green-500/40 text-green-600" : "border-border text-muted-foreground",
          )}
        >
          <Flame className={cn("h-4 w-4", h.completed ? "text-orange-500" : "text-muted-foreground")} />
          <span>
            {h.streak} day{h.streak === 1 ? "" : "s"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold">{h.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="shrink-0 capitalize">
                {h.category}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(h)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(h.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{h.description}</p>

          <div className="mt-3 grid grid-cols-14 gap-1">
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = (h.streak + i) % 4;
              const color = ["bg-muted", "bg-primary/30", "bg-primary/60", "bg-primary/90"][intensity];
              return <div key={i} className={cn("h-2 rounded-sm", color)} />;
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button size="sm" variant={h.completed ? "secondary" : "default"} onClick={() => onToggle(h.id)}>
          {h.completed ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Completed
            </>
          ) : (
            <>Mark Done</>
          )}
        </Button>
      </div>
    </Card>
  );
}
