import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  variant?: "card" | "list" | "detail" | "conversation";
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "card",
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === "card") {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-5 space-y-3"
          >
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4"
          >
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === "conversation") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              i % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div
              className={cn(
                "space-y-2 rounded-2xl p-4",
                i % 2 === 0 ? "bg-muted/50" : "bg-calm-soft/30"
              )}
            >
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
