import { Skeleton } from "@/components/ui/skeleton";

export function ExploreSkeleton() {
  return (
    <div className="h-full flex flex-col relative">
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 md:py-10">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2 h-9 w-32" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg md:w-[340px]" />
          </header>

          <div className="mb-6 flex gap-6 border-b border-border">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-10 w-20 rounded-none" />
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-8 w-24 shrink-0 rounded-full" />
              ))}
            </div>

            <Skeleton className="h-64 w-full rounded-xl" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="overflow-hidden rounded-xl border border-border">
                  <Skeleton className="h-[132px] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
