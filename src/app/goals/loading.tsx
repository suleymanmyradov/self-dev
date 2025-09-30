import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsLoading() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-80 mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28" />
            </div>
          </header>

          <section className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full" />
          </section>

          <div className="my-4" />

          <section className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </section>

          <div className="mt-6">
            <Skeleton className="h-5 w-56" />
            <div className="mt-3 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-72" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
