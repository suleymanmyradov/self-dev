import api from './axios-client';
import {
  GoalsResponseSchema,
  GoalResponseSchema,
  CreateGoalRequestSchema,
  UpdateGoalRequestSchema,
  UpdateGoalProgressRequestSchema,
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
