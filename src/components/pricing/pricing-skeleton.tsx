import { Skeleton } from '@/components/ui/skeleton';

export function PricingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12 space-y-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="flex items-center justify-center gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-11 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
