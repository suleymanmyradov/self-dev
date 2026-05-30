import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api';
import type { Profile } from '@/api';

/**
 * Hook to fetch the current user's profile via TanStack Query.
 * Replaces manual useEffect fetches for consistent caching and error handling.
 */
export function useProfile(initialData?: Profile) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data;
    },
    initialData,
    staleTime: 10 * 60 * 1000, // 10 minutes — profile rarely changes
  });
}
