import api from './client';
import type {
  Habit,
  HabitsResponse,
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  HABITS: '/habits',
  HABIT: (id: string) => `/habits/${id}`,
  HABIT_TOGGLE: (id: string) => `/habits/${id}/toggle`,
  HABITS_RESET_TODAY: '/habits/reset-today',
};

/**
 * List habits with pagination
 */
export async function listHabits(params: PageParams = { page: 1, limit: 20 }): Promise<HabitsResponse> {
  return api.get<HabitsResponse>(ENDPOINTS.HABITS, params);
}

/**
 * Get a single habit by ID
 */
export async function getHabit(id: string): Promise<HabitResponse> {
  return api.get<HabitResponse>(ENDPOINTS.HABIT(id));
}

/**
 * Create a new habit
 */
export async function createHabit(data: CreateHabitRequest): Promise<HabitResponse> {
  return api.post<HabitResponse>(ENDPOINTS.HABITS, data);
}

/**
 * Update an existing habit
 */
export async function updateHabit(id: string, data: UpdateHabitRequest): Promise<HabitResponse> {
  return api.put<HabitResponse>(ENDPOINTS.HABIT(id), data);
}

/**
 * Delete a habit
 */
export async function deleteHabit(id: string): Promise<void> {
  return api.delete(ENDPOINTS.HABIT(id));
}

/**
 * Toggle habit completion status
 */
export async function toggleHabit(id: string): Promise<HabitResponse> {
  return api.post<HabitResponse>(ENDPOINTS.HABIT_TOGGLE(id));
}

/**
 * Reset all habits for today (mark as not completed)
 */
export async function resetTodayHabits(): Promise<void> {
  return api.post(ENDPOINTS.HABITS_RESET_TODAY);
}