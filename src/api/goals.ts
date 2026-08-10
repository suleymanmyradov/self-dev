import api from './axios-client';
import {
  GoalsResponseSchema,
  GoalResponseSchema,
  CreateGoalRequestSchema,
  UpdateGoalRequestSchema,
  UpdateGoalProgressRequestSchema,
  LogGoalValueRequestSchema,
  CreateMilestoneRequestSchema,
} from '@/lib/validation';
import type {
  GoalsResponse,
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  GOALS: '/goals',
  GOAL: (id: string) => `/goals/${encodeURIComponent(id)}`,
  GOAL_TOGGLE: (id: string) => `/goals/${encodeURIComponent(id)}/toggle`,
  GOAL_PROGRESS: (id: string) => `/goals/${encodeURIComponent(id)}/progress`,
  GOAL_VALUE: (id: string) => `/goals/${encodeURIComponent(id)}/value`,
  GOAL_MILESTONES: (id: string) => `/goals/${encodeURIComponent(id)}/milestones`,
  GOAL_MILESTONE_TOGGLE: (id: string, mid: string) =>
    `/goals/${encodeURIComponent(id)}/milestones/${encodeURIComponent(mid)}/toggle`,
  GOAL_MILESTONE: (id: string, mid: string) =>
    `/goals/${encodeURIComponent(id)}/milestones/${encodeURIComponent(mid)}`,
};

/**
 * List goals with pagination
 */
export async function listGoals(params: PageParams = { page: 1, limit: 20 }): Promise<GoalsResponse> {
  const response = await api.get<unknown>(ENDPOINTS.GOALS, params);
  return GoalsResponseSchema.parse(response);
}

/**
 * Get a single goal by ID
 */
export async function getGoal(id: string): Promise<GoalResponse> {
  const response = await api.get<unknown>(ENDPOINTS.GOAL(id));
  return GoalResponseSchema.parse(response);
}

/**
 * Create a new goal
 */
export async function createGoal(data: CreateGoalRequest): Promise<GoalResponse> {
  const validated = CreateGoalRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.GOALS, validated);
  return GoalResponseSchema.parse(response);
}

/**
 * Update an existing goal
 */
export async function updateGoal(id: string, data: UpdateGoalRequest): Promise<GoalResponse> {
  const validated = UpdateGoalRequestSchema.parse(data);
  const response = await api.put<unknown>(ENDPOINTS.GOAL(id), validated);
  return GoalResponseSchema.parse(response);
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string): Promise<void> {
  await api.delete(ENDPOINTS.GOAL(id));
}

/**
 * Toggle goal completion status
 */
export async function toggleGoal(id: string): Promise<GoalResponse> {
  const response = await api.post<unknown>(ENDPOINTS.GOAL_TOGGLE(id));
  return GoalResponseSchema.parse(response);
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(id: string, progress: number): Promise<GoalResponse> {
  const validated = UpdateGoalProgressRequestSchema.parse({ progress });
  const response = await api.put<unknown>(ENDPOINTS.GOAL_PROGRESS(id), validated);
  return GoalResponseSchema.parse(response);
}

/**
 * Log a new current value for a numeric goal (recomputes progress server-side).
 */
export async function logGoalValue(id: string, value: number): Promise<GoalResponse> {
  const validated = LogGoalValueRequestSchema.parse({ value });
  const response = await api.put<unknown>(ENDPOINTS.GOAL_VALUE(id), validated);
  return GoalResponseSchema.parse(response);
}

/**
 * Create a milestone step for a milestone-type goal.
 */
export async function createMilestone(
  id: string,
  title: string,
  sortOrder?: number,
): Promise<GoalResponse> {
  const validated = CreateMilestoneRequestSchema.parse({ title, sortOrder });
  const response = await api.post<unknown>(ENDPOINTS.GOAL_MILESTONES(id), validated);
  return GoalResponseSchema.parse(response);
}

/**
 * Toggle a milestone's done/not-done state (recomputes goal progress).
 */
export async function toggleMilestone(id: string, milestoneId: string): Promise<GoalResponse> {
  const response = await api.post<unknown>(ENDPOINTS.GOAL_MILESTONE_TOGGLE(id, milestoneId));
  return GoalResponseSchema.parse(response);
}

/**
 * Delete a milestone step (recomputes goal progress).
 */
export async function deleteMilestone(id: string, milestoneId: string): Promise<void> {
  await api.delete(ENDPOINTS.GOAL_MILESTONE(id, milestoneId));
}
