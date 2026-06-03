import { Skeleton } from "@/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-7 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <div className="flex gap-2 mb-6 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md p-3 border space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
