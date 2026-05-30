import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api';
import type { Profile } from '@/api';

export function useProfile(initialProfile?: Profile) {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => getCurrentUser(),
    select: (data) => data.data,
    initialData: initialProfile ? { data: initialProfile, page: undefined } : undefined,
    staleTime: 5 * 60 * 1000,
  });
}
