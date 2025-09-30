'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 max-w-[600px] mx-auto w-full">
          <div className="w-full border-b pb-3 sticky top-0 z-20 bg-background md:static">
            <div className="h-9 flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>

          <div className="mt-4 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
