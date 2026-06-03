import { Suspense } from 'react';
import { SavedClient } from '@/components/saved/saved-client';
import { listSavedDetailedServer } from '@/api/server';
import { SavedSkeleton } from '@/components/saved/saved-skeleton';

export default async function SavedPage() {
  const savedPromise = listSavedDetailedServer({ page: 1, limit: 100 }).catch(() => ({ data: [], page: { total: 0, page: 1, limit: 100, totalPages: 0 } }));

  return (
    <Suspense fallback={<SavedSkeleton />}>
      <SavedClient savedPromise={savedPromise} />
    </Suspense>
  );
}
