"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Habit } from "@/api";
import { Check, Flame, MoreHorizontal, Pencil, Trash2, Sparkles } from "lucide-react";

export type HabitCardProps = {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onCheckIn: (habit: Habit) => void;
  deleting?: boolean;
};

export const HabitCard = memo(function HabitCard({ habit: h, onEdit, onDelete, onCheckIn, deleting }: HabitCardProps) {
  const categoryStyle = CATEGORY_COLORS[h.category] || "bg-secondary text-secondary-foreground border-border";

  return (
    <Card
      data-deleting={deleting || undefined}
      className={cn(
        "p-5 transition-all duration-300 hover-lift",
        h.completed && "ring-1 ring-growth/30 bg-growth-soft/30",
        "data-[deleting=true]:opacity-0 data-[deleting=true]:-translate-y-2 data-[deleting=true]:scale-[0.98]"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Streak indicator */}
        <div className={cn(
          "flex flex-col items-center justify-center rounded-xl p-3 transition-colors",
          h.completed ? "bg-growth text-growth-foreground" : "bg-muted"
        )}>
          <Flame className={cn("h-5 w-5", h.completed ? "text-growth-foreground" : "text-muted-foreground")} />
          <span className={cn(
            "mt-1 text-lg font-bold tabular-nums",
            h.completed ? "text-growth-foreground" : "text-muted-foreground"
          )}>
            {h.streak}
          </span>
          <span className={cn(
            "text-[0.65rem] uppercase tracking-wide",
            h.completed ? "text-growth-foreground/80" : "text-muted-foreground"
          )}>
            days
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "truncate text-base font-semibold transition-colors",
              h.completed && "text-growth"
            )}>
              {h.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("shrink-0 capitalize border", categoryStyle)}>
                {h.category}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Open actions menu">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(h)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(h.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {h.description}
          </p>

          {/* Progress visualization - GitHub-style contribution graph */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-muted-foreground">Last 28 days</span>
              {h.streak >= 7 && (
                <span className="inline-flex items-center gap-1 text-xs text-growth">
                  <Sparkles className="h-3 w-3" /> Great momentum!
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = Math.min(3, Math.floor((h.streak + i * 0.5) % 4));
                const colors = [
                  "bg-muted",
                  "bg-growth/30",
                  "bg-growth/60",
                  "bg-growth"
                ];
                return (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      "h-3 w-2.5 rounded-sm transition-colors",
                      colors[intensity]
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4 flex items-center justify-end">
        <Button
          size="sm"
          variant={h.completed ? "success" : "growth"}
          onClick={() => onCheckIn(h)}
          className="min-w-[120px]"
        >
          {h.completed ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Done Today
            </>
          ) : (
            <>Check In</>
          )}
        </Button>
      </div>
    </Card>
  );
});
