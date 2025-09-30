import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-md p-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
