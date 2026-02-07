import webapi from "./gocliRequest"
import * as components from "./growthapiComponents"
export * from "./growthapiComponents"

/**
 * @description 
 * @param params
 */
export function getActivityFeed(params: components.PageRequestParams) {
	return webapi.get<components.ActivityResponse>(`/api/v1/activity`, params)
}

/**
 * @description 
 * @param params
 */
export function listArticles(params: components.ListArticlesRequestParams) {
	return webapi.get<components.ArticlesResponse>(`/api/v1/articles`, params)
}

/**
 * @description 
 * @param params
 */
export function getArticle(params: components.ArticleRequestParams, id: string) {
	return webapi.get<components.ArticleResponse>(`/api/v1/articles/${id}`, params)
}

/**
 * @description 
 * @param req
 */
export function login(req: components.LoginRequest) {
	return webapi.post<components.AuthResponse>(`/api/v1/auth/login`, req)
}

/**
 * @description 
 */
export function logout() {
	return webapi.post<components.EmptyResponse>(`/api/v1/auth/logout`, {})
}

/**
 * @description 
 * @param req
 */
export function refreshToken(req: components.RefreshRequest) {
	return webapi.post<components.AuthResponse>(`/api/v1/auth/refresh`, req)
}

/**
 * @description 
 * @param req
 */
export function register(req: components.RegisterRequest) {
	return webapi.post<components.AuthResponse>(`/api/v1/auth/register`, req)
}

/**
 * @description 
 * @param params
 */
export function listConversations(params: components.ListConversationsRequestParams) {
	return webapi.get<components.ConversationsResponse>(`/api/v1/conversations`, params)
}

/**
 * @description 
 * @param req
 */
export function startConversation(req: components.StartConversationRequest) {
	return webapi.post<components.ConversationResponse>(`/api/v1/conversations`, req)
}

/**
 * @description 
 * @param params
 */
export function getConversation(params: components.ConversationRequestParams, id: string) {
	return webapi.get<components.ConversationDetailResponse>(`/api/v1/conversations/${id}`, params)
}

/**
 * @description 
 * @param req
 */
export function sendMessage(req: components.SendMessageRequest, id: string) {
	return webapi.post<components.MessageResponse>(`/api/v1/conversations/${id}/messages`, req)
}

/**
 * @description 
 * @param params
 */
export function getMessages(params: components.GetMessagesRequestParams, id: string) {
	return webapi.get<components.MessagesResponse>(`/api/v1/conversations/${id}/messages`, params)
}

/**
 * @description 
 * @param params
 */
export function listGoals(params: components.PageRequestParams) {
	return webapi.get<components.GoalsResponse>(`/api/v1/goals`, params)
}

/**
 * @description 
 * @param req
 */
export function createGoal(req: components.CreateGoalRequest) {
	return webapi.post<components.GoalResponse>(`/api/v1/goals`, req)
}

/**
 * @description 
 * @param params
 */
export function getGoal(params: components.GoalRequestParams, id: string) {
	return webapi.get<components.GoalResponse>(`/api/v1/goals/${id}`, params)
}

/**
 * @description 
 * @param req
 */
export function updateGoal(req: components.UpdateGoalRequest, id: string) {
	return webapi.put<components.GoalResponse>(`/api/v1/goals/${id}`, req)
}

/**
 * @description 
 * @param params
 */
export function deleteGoal(params: components.GoalRequestParams, id: string) {
	return webapi.delete<components.EmptyResponse>(`/api/v1/goals/${id}`, params)
}

/**
 * @description 
 * @param req
 */
export function updateGoalProgress(req: components.UpdateProgressRequest, id: string) {
	return webapi.put<components.GoalResponse>(`/api/v1/goals/${id}/progress`, req)
}

/**
 * @description 
 * @param params
 */
export function toggleGoal(params: components.GoalRequestParams, id: string) {
	return webapi.post<components.GoalResponse>(`/api/v1/goals/${id}/toggle`, params)
}

/**
 * @description 
 * @param params
 */
export function listHabits(params: components.PageRequestParams) {
	return webapi.get<components.HabitsResponse>(`/api/v1/habits`, params)
}

/**
 * @description 
 * @param req
 */
export function createHabit(req: components.CreateHabitRequest) {
	return webapi.post<components.HabitResponse>(`/api/v1/habits`, req)
}

/**
 * @description 
 * @param params
 */
export function getHabit(params: components.HabitRequestParams, id: string) {
	return webapi.get<components.HabitResponse>(`/api/v1/habits/${id}`, params)
}

/**
 * @description 
 * @param req
 */
export function updateHabit(req: components.UpdateHabitRequest, id: string) {
	return webapi.put<components.HabitResponse>(`/api/v1/habits/${id}`, req)
}

/**
 * @description 
 * @param params
 */
export function deleteHabit(params: components.HabitRequestParams, id: string) {
	return webapi.delete<components.EmptyResponse>(`/api/v1/habits/${id}`, params)
}

/**
 * @description 
 * @param params
 */
export function toggleHabit(params: components.HabitRequestParams, id: string) {
	return webapi.post<components.HabitResponse>(`/api/v1/habits/${id}/toggle`, params)
}

/**
 * @description 
 */
export function resetTodayHabits() {
	return webapi.post<components.EmptyResponse>(`/api/v1/habits/reset-today`, {})
}

/**
 * @description 
 * @param params
 */
export function listNotifications(params: components.PageRequestParams) {
	return webapi.get<components.NotificationsResponse>(`/api/v1/notifications`, params)
}

/**
 * @description 
 * @param params
 */
export function markNotificationRead(params: components.NotificationRequestParams, id: string) {
	return webapi.put<components.EmptyResponse>(`/api/v1/notifications/${id}/read`, params)
}

/**
 * @description 
 */
export function markAllNotificationsRead() {
	return webapi.put<components.EmptyResponse>(`/api/v1/notifications/read-all`, {})
}

/**
 * @description 
 * @param req
 */
export function updateProfile(req: components.UpdateProfileRequest) {
	return webapi.put<components.ProfileResponse>(`/api/v1/profile`, req)
}

/**
 * @description 
 */
export function getProfile() {
	return webapi.get<components.ProfileResponse>(`/api/v1/profile/me`, {})
}

/**
 * @description 
 * @param req
 */
export function submitReport(req: components.ReportRequest) {
	return webapi.post<components.EmptyResponse>(`/api/v1/report`, req)
}

/**
 * @description 
 * @param params
 */
export function listSaved(params: components.PageRequestParams) {
	return webapi.get<components.SavedItemsResponse>(`/api/v1/saved`, params)
}

/**
 * @description 
 * @param req
 */
export function saveItem(req: components.SaveItemRequest) {
	return webapi.post<components.SavedItemResponse>(`/api/v1/saved`, req)
}

/**
 * @description 
 * @param params
 */
export function removeSaved(params: components.SavedItemRequestParams, id: string) {
	return webapi.delete<components.EmptyResponse>(`/api/v1/saved/${id}`, params)
}

/**
 * @description 
 * @param params
 */
export function search(params: components.SearchRequestParams) {
	return webapi.get<components.SearchResponse>(`/api/v1/search`, params)
}

/**
 * @description 
 */
export function getSettings() {
	return webapi.get<components.SettingsResponse>(`/api/v1/settings`, {})
}

/**
 * @description 
 * @param req
 */
export function updateSettings(req: components.UpdateSettingsRequest) {
	return webapi.put<components.SettingsResponse>(`/api/v1/settings`, req)
}
