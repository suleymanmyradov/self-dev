import { Skeleton } from "@/components/ui/skeleton";

export function WeeklyReviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
      <div className="space-y-6">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-8 w-3/4" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>

          {/* 4 metric cards */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />

          {/* Chart placeholder */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <Skeleton className="h-3 w-4" />
                  <Skeleton className="w-full max-w-[28px] rounded-t-sm" style={{ height: `${30 + (i % 3) * 20}%` }} />
                  <Skeleton className="h-3 w-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Habit breakdown placeholder */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-4 w-24" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>

          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Supporting sections */}
        <div className="w-full space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
