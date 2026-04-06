import api from './client';
import type {
  Goal,
  GoalsResponse,
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateGoalProgressRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  GOALS: '/goals',
  GOAL: (id: string) => `/goals/${id}`,
  GOAL_TOGGLE: (id: string) => `/goals/${id}/toggle`,
  GOAL_PROGRESS: (id: string) => `/goals/${id}/progress`,
};

/**
 * List goals with pagination
 */
export async function listGoals(params: PageParams = { page: 1, limit: 20 }): Promise<GoalsResponse> {
  return api.get<GoalsResponse>(ENDPOINTS.GOALS, params);
}

/**
 * Get a single goal by ID
 */
export async function getGoal(id: string): Promise<GoalResponse> {
  return api.get<GoalResponse>(ENDPOINTS.GOAL(id));
}

/**
 * Create a new goal
 */
export async function createGoal(data: CreateGoalRequest): Promise<GoalResponse> {
  return api.post<GoalResponse>(ENDPOINTS.GOALS, data);
}

/**
 * Update an existing goal
 */
export async function updateGoal(id: string, data: UpdateGoalRequest): Promise<GoalResponse> {
  return api.put<GoalResponse>(ENDPOINTS.GOAL(id), data);
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string): Promise<void> {
  return api.delete(ENDPOINTS.GOAL(id));
}

/**
 * Toggle goal completion status
 */
export async function toggleGoal(id: string): Promise<GoalResponse> {
  return api.post<GoalResponse>(ENDPOINTS.GOAL_TOGGLE(id));
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(id: string, progress: number): Promise<GoalResponse> {
  const data: UpdateGoalProgressRequest = { progress };
  return api.put<GoalResponse>(ENDPOINTS.GOAL_PROGRESS(id), data);
}