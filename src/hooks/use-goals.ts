import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoal,
  updateGoalProgress,
  logGoalValue,
  createMilestone,
  toggleMilestone,
  deleteMilestone,
} from '@/api';
import type { CreateGoalRequest, UpdateGoalRequest, GoalsResponse } from '@/api';
import { toast } from 'sonner';

/**
 * Hook to fetch all goals
 */
export function useGoals(initialData?: GoalsResponse) {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => listGoals(),
    select: (data) => data.data,
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes — mutations invalidate cache
  });
}

/**
 * Hook to fetch a single goal
 */
export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => getGoal(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Hook to create a new goal
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully');
    },
  });
}

/**
 * Hook to update a goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) => updateGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
      toast.success('Goal updated successfully');
    },
  });
}

/**
 * Hook to delete a goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully');
    },
  });
}

/**
 * Hook to toggle goal completion
 */
export function useToggleGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleGoal(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', id] });
    },
  });
}

/**
 * Hook to update goal progress
 */
export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => updateGoalProgress(id, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
}

/**
 * Hook to log a new value for a numeric goal
 */
export function useLogGoalValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => logGoalValue(id, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
      toast.success('Value logged');
    },
  });
}

/**
 * Hook to create a milestone
 */
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title, sortOrder }: { id: string; title: string; sortOrder?: number }) =>
      createMilestone(id, title, sortOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
}

/**
 * Hook to toggle a milestone's done state
 */
export function useToggleMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, milestoneId }: { id: string; milestoneId: string }) =>
      toggleMilestone(id, milestoneId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
}

/**
 * Hook to delete a milestone
 */
export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, milestoneId }: { id: string; milestoneId: string }) =>
      deleteMilestone(id, milestoneId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
}
