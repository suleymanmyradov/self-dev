import { Skeleton } from '@/components/ui/skeleton';

export const AIConversationLoading = () => {
  return (
    <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex-1 rounded-md border p-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};
