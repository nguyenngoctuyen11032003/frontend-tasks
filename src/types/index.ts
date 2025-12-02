// ==================== USER & AUTH ====================
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  roles: Role[]
  permissions: Permission[]
  status: "online" | "offline" | "away"
  department?: string
  role?: string // Job title (for display)
  jobRole?: string // Job role (backend field)
  phone?: string
  bio?: string
  isLocked?: boolean
  createdAt: string
  updatedAt: string
}

export interface RoleDefinition {
  id: string
  name: string
  displayName: string
  description: string
  permissions: Permission[]
  isSystem: boolean // System roles cannot be deleted
  color: string
  createdAt: string
  updatedAt: string
}

export type Role = "super_admin" | "admin" | "manager" | "member" | "guest" | string

export type Permission =
  | "projects.create"
  | "projects.update"
  | "projects.delete"
  | "projects.view"
  | "tasks.create"
  | "tasks.update"
  | "tasks.delete"
  | "tasks.view"
  | "tasks.assign"
  | "tasks.complete"
  | "notes.create"
  | "notes.update"
  | "notes.delete"
  | "notes.view"
  | "chat.create"
  | "chat.send"
  | "chat.delete"
  | "reports.view"
  | "reports.export"
  | "reports.create"
  | "users.view"
  | "users.manage"
  | "users.invite"
  | "roles.view"
  | "roles.manage"
  | "roles.create"
  | "roles.delete"
  | "settings.view"
  | "settings.manage"
  | "team.view"
  | "team.manage"

export const PERMISSION_GROUPS = {
  projects: {
    label: "Dự án",
    permissions: ["projects.create", "projects.update", "projects.delete", "projects.view"] as Permission[],
  },
  tasks: {
    label: "Công việc",
    permissions: ["tasks.create", "tasks.update", "tasks.delete", "tasks.view", "tasks.assign", "tasks.complete"] as Permission[],
  },
  notes: {
    label: "Ghi chú",
    permissions: ["notes.create", "notes.update", "notes.delete", "notes.view"] as Permission[],
  },
  chat: {
    label: "Tin nhắn",
    permissions: ["chat.create", "chat.send", "chat.delete"] as Permission[],
  },
  reports: {
    label: "Báo cáo",
    permissions: ["reports.view", "reports.export", "reports.create"] as Permission[],
  },
  users: {
    label: "Người dùng",
    permissions: ["users.view", "users.manage", "users.invite"] as Permission[],
  },
  roles: {
    label: "Vai trò",
    permissions: ["roles.view", "roles.manage", "roles.create", "roles.delete"] as Permission[],
  },
  settings: {
    label: "Cài đặt",
    permissions: ["settings.view", "settings.manage"] as Permission[],
  },
  team: {
    label: "Nhóm",
    permissions: ["team.view", "team.manage"] as Permission[],
  },
} as const

export const PERMISSION_LABELS: Record<Permission, string> = {
  "projects.create": "Tạo dự án",
  "projects.update": "Sửa dự án",
  "projects.delete": "Xóa dự án",
  "projects.view": "Xem dự án",
  "tasks.create": "Tạo công việc",
  "tasks.update": "Sửa công việc",
  "tasks.delete": "Xóa công việc",
  "tasks.view": "Xem công việc",
  "tasks.assign": "Giao công việc",
  "tasks.complete": "Hoàn thành công việc",
  "notes.create": "Tạo ghi chú",
  "notes.update": "Sửa ghi chú",
  "notes.delete": "Xóa ghi chú",
  "notes.view": "Xem ghi chú",
  "chat.create": "Tạo nhóm chat",
  "chat.send": "Gửi tin nhắn",
  "chat.delete": "Xóa tin nhắn",
  "reports.view": "Xem báo cáo",
  "reports.export": "Xuất báo cáo",
  "reports.create": "Tạo báo cáo",
  "users.view": "Xem người dùng",
  "users.manage": "Quản lý người dùng",
  "users.invite": "Mời người dùng",
  "roles.view": "Xem vai trò",
  "roles.manage": "Quản lý vai trò",
  "roles.create": "Tạo vai trò",
  "roles.delete": "Xóa vai trò",
  "settings.view": "Xem cài đặt",
  "settings.manage": "Quản lý cài đặt",
  "team.view": "Xem nhóm",
  "team.manage": "Quản lý nhóm",
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ==================== ADMIN ====================
export interface SystemSetting {
  id: string
  key: string
  value: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  user: User
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  projectId?: string
  project?: Project
  createdAt: string
}

export interface ActivityLogQuery {
  userId?: string
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface DashboardStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  projects: {
    total: number
    active: number
    archived: number
  }
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  content: {
    notes: number
    chats: number
  }
  notifications: {
    total: number
    unread: number
  }
}

export interface UserActivityStat {
  date: string
  count: number
}

export interface TopUser {
  userId: string
  fullName: string
  email: string
  activityCount: number
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy'
  database: {
    connected: boolean
  }
  server: {
    uptime: number
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
  }
  timestamp: string
}

export interface DatabaseCleanupResult {
  deletedActivityLogs: number
  deletedSessions: number
  deletedNotifications: number
}

// ==================== PROJECT ====================
export interface Project {
  id: string
  name: string
  description: string
  progress: number
  members: string[] // Array of user IDs
  deadline: string
  tags: Tag[]
  status: "active" | "completed" | "archived" | "on-hold"
  color: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  name: string
  avatar?: string
  role: "owner" | "admin" | "member"
}

// ==================== TASK ====================
export type TaskStatus = "todo" | "in_progress" | "review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignees: User[]
  assignedBy?: User // Person who assigned the task
  projectId: string
  dueDate: string
  reminders?: TaskReminder[] // Task reminders
  createdAt: string
  updatedAt: string
  commentsCount: number
  estimatedHours: number
  tags: Tag[]
  checklist: ChecklistItem[]
  attachments: Attachment[]
}

export interface TaskReminder {
  id: string
  taskId: string
  reminderDate: string
  message: string
  isActive: boolean
  createdBy: User
  createdAt: string
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: User
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
  updatedAt: string
  reactions: Reaction[]
}

export interface Reaction {
  emoji: string
  users: User[]
}

// ==================== NOTE ====================
export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  isShared: boolean
  sharedWith: User[]
  createdBy: User
  projectId?: string
  isPinned?: boolean
  createdAt: string
  updatedAt: string
}

// ==================== CHAT ====================
export interface Chat {
  id: string
  name?: string
  type: "group" | "direct"
  members: string[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export type ChatRoom = Chat

export interface Message {
  id: string
  chatId: string
  content: string
  type: "text" | "image" | "file"
  sender: User
  attachments?: Attachment[]
  readBy: string[]
  createdAt: string
}

// ==================== COMMON ====================
export interface Tag {
  id: string
  name: string
  color: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "task_assigned" | "task_completed" | "comment" | "mention" | "deadline" | "project_added"
  read: boolean
  createdAt: string
  link?: string
}

// ==================== REPORT ====================
export interface ReportFilter {
  dateRange: {
    start: string
    end: string
  }
  projectIds?: string[]
  assigneeIds?: string[]
  status?: TaskStatus[]
  tags?: string[]
}

export interface ReportExportRequest {
  filters: ReportFilter
  groupBy: "project" | "assignee" | "week" | "status"
  format: "pdf" | "csv"
  includeCharts?: boolean
  includeAttachments?: boolean
}

// ==================== API RESPONSE ====================
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}
