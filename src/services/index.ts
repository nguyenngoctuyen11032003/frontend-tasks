/**
 * Centralized exports for all service modules
 * Import services from here for cleaner code
 */

// Core Services
export { projectsService } from './projects.service'
export { tasksService } from './tasks.service'
export { notesService } from './notes.service'
export { TagsService } from './tags.service'

// Communication Services
export { ChatService, chatService } from './chat.service'
export { NotificationsService } from './notifications.service'
export { EmailService, emailService } from './email.service'

// System Services
export { SettingsService, settingsService } from './settings.service'
export { DashboardService, dashboardService } from './dashboard.service'
export { UploadService } from './upload.service'
export { reportsService } from './reports.service'

// Supporting Services
export { UsersService } from './users.service'
export { ActivityLogsService } from './activity-logs.service'
export { CommentsService } from './comments.service'

// Types
export type {
  // Projects
  CreateProjectPayload,
  UpdateProjectPayload,
  QueryProjectParams,
  ProjectsResponse,
  ProjectStatistics,
} from './projects.service'

export type {
  // Tasks
  CreateTaskPayload,
  UpdateTaskPayload,
  QueryTaskParams,
  TasksResponse,
  TaskStatistics,
} from './tasks.service'

export type {
  // Notes
  CreateNotePayload,
  UpdateNotePayload,
  QueryNoteParams,
  NotesResponse,
  NoteStatistics,
} from './notes.service'

export type {
  // Chat
  CreateChatDto,
  UpdateChatDto,
  QueryChatDto,
  CreateMessageDto,
  QueryMessageDto,
} from './chat.service'

export type {
  // Settings
  Theme,
  UserSettings,
  CreateThemeDto,
  UpdateThemeDto,
  UpdateUserSettingsDto,
  SystemDefaults,
} from './settings.service'

export type {
  // Email
  SendEmailDto,
  EmailStats,
  EmailResponse,
} from './email.service'

export type {
  // Notifications
  QueryNotificationParams,
  NotificationResponse,
  StatisticsResponse,
} from './notifications.service'

export type {
  // Reports
  GenerateReportRequest,
  ReportType,
  ExportFormat,
  ChartDataResponse,
  StatisticsResponse as ReportStatistics,
  ChartType,
  GetChartDataRequest,
  ChartDataPoint,
} from './reports.service'

export type {
  // Search
  SearchType,
  SearchResultTask,
  SearchResultProject,
  SearchResultNote,
  SearchResultUser,
  SearchResultChat,
  GlobalSearchResponse,
  SearchSuggestion,
  SearchSuggestionsResponse,
} from './search.service'

// Re-export error classes
export { ReportsApiError } from './reports.service'
