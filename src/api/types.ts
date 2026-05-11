// ============================================
// Pagination
// ============================================

export interface PageParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PageResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Generic API Response
// ============================================

export interface ApiResponse<T> {
  data: T;
  page?: PageResponse;
}

export interface EmptyResponse {}

// ============================================
// Goal Types
// ============================================

export type GoalCategory = 'productivity' | 'health' | 'mindfulness';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  dueDate?: string;
  progress: number;
  completed: boolean;
  relatedHabitIds?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: GoalCategory;
  dueDate?: string;
  relatedHabitIds?: string[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: GoalCategory;
  dueDate?: string;
  relatedHabitIds?: string[];
}

export interface UpdateGoalProgressRequest {
  progress: number;
}

export interface GoalsResponse extends ApiResponse<Goal[]> {
  page: PageResponse;
}

export interface GoalResponse extends ApiResponse<Goal> {}

// ============================================
// Habit Types
// ============================================

export type HabitCategory = 'productivity' | 'health' | 'mindfulness';

export interface Habit {
  id: string;
  name: string;
  description: string;
  streak: number;
  completed: boolean;
  category: HabitCategory;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description: string;
  category: HabitCategory;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  category?: HabitCategory;
}

export interface HabitsResponse extends ApiResponse<Habit[]> {
  page: PageResponse;
}

export interface HabitResponse extends ApiResponse<Habit> {}

// ============================================
// Check-In Types
// ============================================

export type CheckInStatus = 'completed' | 'missed';
export type CheckInMood = 'great' | 'okay' | 'low' | 'stressed';
export type CheckInEnergy = 'high' | 'medium' | 'low';
export type CheckInBlocker = 'lack_of_time' | 'low_motivation' | 'too_distracted' | 'unclear_plan' | 'other';

export interface CheckIn {
  id: string;
  userId: string;
  habitId: string;
  status: CheckInStatus;
  mood?: CheckInMood;
  energy?: CheckInEnergy;
  blocker?: CheckInBlocker;
  note?: string;
  createdAt: string;
}

export interface CreateCheckInRequest {
  habitId: string;
  status: CheckInStatus;
  mood?: CheckInMood;
  energy?: CheckInEnergy;
  blocker?: CheckInBlocker;
  note?: string;
}

export interface CheckInsResponse extends ApiResponse<CheckIn[]> {}
export interface CheckInResponse extends ApiResponse<CheckIn> {}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: Profile;
}

// ============================================
// Profile Types
// ============================================

export interface Profile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  avatarUrl?: string;
}

export interface ProfileResponse extends ApiResponse<Profile> {}

// ============================================
// Article Types
// ============================================

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category?: ArticleCategory;
  readTime: number;
  imageUrl: string;
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse extends ApiResponse<Article[]> {
  page: PageResponse;
}

export interface ArticleResponse extends ApiResponse<Article> {}

export interface ListArticlesParams extends PageParams {
  category?: string;
}

// ============================================
// Activity Types
// ============================================

export type ActivityType = 'habit_completed' | 'goal_created' | 'goal_completed' | 'article_saved';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: string;
  userId: string;
  createdAt: string;
}

export interface ActivityResponse extends ApiResponse<Activity[]> {
  page: PageResponse;
}

// ============================================
// Conversation Types
// ============================================

export type ConversationType = 'coach' | 'therapist';
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  type: ConversationType;
  lastMessage: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface StartConversationRequest {
  type: ConversationType;
  title?: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> {
  page: PageResponse;
}

export interface ConversationResponse extends ApiResponse<Conversation> {}

export interface ConversationDetailResponse extends ApiResponse<ConversationDetail> {}

export interface MessagesResponse extends ApiResponse<Message[]> {
  page: PageResponse;
}

export interface MessageResponse extends ApiResponse<Message> {}

export interface ListConversationsParams extends PageParams {
  type?: ConversationType;
}

// ============================================
// Settings Types
// ============================================

export type AccountabilityStyle = 'gentle' | 'balanced' | 'strict';

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  habitReminders: boolean;
  goalReminders: boolean;
  accountabilityStyle: AccountabilityStyle;
  checkInTime: string;
  onboardingCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  habitReminders?: boolean;
  goalReminders?: boolean;
  accountabilityStyle?: AccountabilityStyle;
  checkInTime?: string;
  onboardingCompleted?: boolean;
}

export interface SettingsResponse extends ApiResponse<Settings> {}

// ============================================
// Notification Types
// ============================================

export type NotificationType = 'habit_reminder' | 'goal_deadline' | 'achievement' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  createdAt: string;
}

export interface NotificationsResponse extends ApiResponse<Notification[]> {
  page: PageResponse;
}

// ============================================
// Search Types
// ============================================

export type SearchResultType = 'article' | 'goal' | 'habit' | 'conversation';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  score: number;
  highlight?: string;
}

export interface SearchResponse extends ApiResponse<SearchResult[]> {
  page: PageResponse;
}

export interface SearchParams extends PageParams {
  q: string;
  type?: SearchResultType;
}

// ============================================
// Saved Items Types
// ============================================

export type SavedItemType = 'article' | 'goal' | 'habit';

export interface SavedItem {
  id: string;
  itemType: SavedItemType;
  itemId: string;
  userId: string;
  createdAt: string;
}

export interface SaveItemRequest {
  itemType: SavedItemType;
  itemId: string;
}

export interface SavedItemsResponse extends ApiResponse<SavedItem[]> {
  page: PageResponse;
}

export interface SavedItemResponse extends ApiResponse<SavedItem> {}

// ============================================
// Report Types
// ============================================

export type ReportType = 'bug' | 'feedback' | 'abuse';

export interface ReportRequest {
  type: ReportType;
  title: string;
  description: string;
  email?: string;
}

// ============================================
// Category Types
// ============================================

export type EntityType = 'article' | 'habit' | 'goal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  entityType: EntityType;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse extends ApiResponse<Category[]> {}
