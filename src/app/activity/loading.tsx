import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityLoading() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-56 mt-2" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </header>

          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-7 w-16 rounded-md" />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
