import api from './axios-client';
import {
  HabitsResponseSchema,
  HabitResponseSchema,
  CreateHabitRequestSchema,
  UpdateHabitRequestSchema,
} from '@/lib/validation';
import type {
  HabitsResponse,
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  PageParams,
} from './types';

const ENDPOINTS = {
  HABITS: '/habits',
  HABIT: (id: string) => `/habits/${encodeURIComponent(id)}`,
  HABITS_RESET_TODAY: '/habits/reset-today',
};

/**
 * List habits with pagination
 */
export async function listHabits(params: PageParams = { page: 1, limit: 20 }): Promise<HabitsResponse> {
  const response = await api.get<unknown>(ENDPOINTS.HABITS, params);
  return HabitsResponseSchema.parse(response);
}

/**
 * Get a single habit by ID
 */
export async function getHabit(id: string): Promise<HabitResponse> {
  const response = await api.get<unknown>(ENDPOINTS.HABIT(id));
  return HabitResponseSchema.parse(response);
}

/**
 * Create a new habit
 */
export async function createHabit(data: CreateHabitRequest): Promise<HabitResponse> {
  const validated = CreateHabitRequestSchema.parse(data);
  const response = await api.post<unknown>(ENDPOINTS.HABITS, validated);
  return HabitResponseSchema.parse(response);
}

/**
 * Update an existing habit
 */
export async function updateHabit(id: string, data: UpdateHabitRequest): Promise<HabitResponse> {
  const validated = UpdateHabitRequestSchema.parse(data);
  const response = await api.put<unknown>(ENDPOINTS.HABIT(id), validated);
  return HabitResponseSchema.parse(response);
}

/**
 * Delete a habit
 */
export async function deleteHabit(id: string): Promise<void> {
  await api.delete(ENDPOINTS.HABIT(id));
}

/**
 * Reset all habits for today (mark as not completed)
 */
export async function resetTodayHabits(): Promise<void> {
  await api.post(ENDPOINTS.HABITS_RESET_TODAY);
}
