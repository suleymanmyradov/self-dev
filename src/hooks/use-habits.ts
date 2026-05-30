import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listHabits, getHabit, createHabit, updateHabit, deleteHabit, toggleHabit, resetTodayHabits } from '@/api';
import type { CreateHabitRequest, UpdateHabitRequest, HabitsResponse } from '@/api';

/**
 * Hook to fetch all habits
 */
export function useHabits(params?: { page?: number; limit?: number }, initialData?: HabitsResponse) {
  return useQuery({
    queryKey: ['habits', params],
    queryFn: () => listHabits(params),
    select: (data) => data.data,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes — mutations invalidate cache
  });
}

/**
 * Hook to fetch a single habit
 */
export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: () => getHabit(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Hook to create a new habit
 */
export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateHabitRequest) => createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

/**
 * Hook to update a habit
 */
export function useUpdateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) => updateHabit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', variables.id] });
    },
  });
}

/**
 * Hook to delete a habit
 */
export function useDeleteHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

/**
 * Hook to toggle habit completion
 */
export function useToggleHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => toggleHabit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', id] });
    },
  });
}

/**
 * Hook to reset all habits for today
 */
export function useResetTodayHabits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => resetTodayHabits(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
