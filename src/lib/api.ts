import type {
  User,
  Project,
  Task,
  Note,
  Chat,
  Message,
  Notification,
  PaginatedResponse,
  ReportExportRequest,
  RoleDefinition,
  SystemSetting,
  ActivityLog,
  ActivityLogQuery,
  DashboardStats,
  UserActivityStat,
  TopUser,
  SystemHealth,
  DatabaseCleanupResult,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private initialized: boolean = false

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Initialize token from storage on client side
    if (typeof window !== 'undefined') {
      this.initializeToken()
    }
  }

  private initializeToken() {
    if (this.initialized) return
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
          this.token = state.token
          console.log('🔑 Token restored from storage')
        }
      }
    } catch (error) {
      console.warn('Failed to restore token:', error)
    }
    this.initialized = true
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle different HTTP status codes
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Đã xảy ra lỗi không xác định" }))
        
        // Handle specific status codes
        switch (response.status) {
          case 401:
            // Unauthorized - clear auth and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage')
              window.location.href = '/login'
            }
            throw new Error(error.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          case 403:
            throw new Error(error.message || "Bạn không có quyền thực hiện thao tác này")
          case 404:
            throw new Error(error.message || "Không tìm thấy tài nguyên")
          case 409:
            throw new Error(error.message || "Dữ liệu đã tồn tại")
          case 422:
            throw new Error(error.message || "Dữ liệu không hợp lệ")
          case 500:
            throw new Error(error.message || "Lỗi máy chủ. Vui lòng thử lại sau.")
          default:
            throw new Error(error.message || `Lỗi ${response.status}: ${response.statusText}`)
        }
      }

      // For DELETE requests with 204 No Content, don't parse JSON
      if (response.status === 204 || options.method === 'DELETE') {
        return undefined as T
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type")
      const contentLength = response.headers.get("content-length")
      
      // If no content or empty body, return undefined
      if (contentLength === "0" || contentLength === null) {
        const text = await response.text()
        if (!text || text.trim() === "") {
          return undefined as T
        }
      }
      
      if (contentType && contentType.includes("application/json")) {
        return response.json()
      }

      // For responses without JSON content (like successful DELETE)
      return undefined as T
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.")
      }
      throw error
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string, phone?: string) {
    return this.request<{ message: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async verifyEmail(token: string) {
    return this.request<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    })
  }

  async getProfile() {
    return this.request<User>("/auth/profile")
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>("/projects")
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`)
  }

  async createProject(data: Partial<Project>) {
    return this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, { method: "DELETE" })
  }

  // Tasks
  async getTasks(params?: {
    projectId?: string
    status?: string
    assignee?: string
    page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.projectId) searchParams.set("projectId", params.projectId)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.assignee) searchParams.set("assignee", params.assignee)
    if (params?.page) searchParams.set("page", params.page.toString())

    return this.request<PaginatedResponse<Task>>(`/tasks?${searchParams.toString()}`)
  }

  async getTask(id: string) {
    return this.request<Task>(`/tasks/${id}`)
  }

  async createTask(data: Partial<Task>) {
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, { method: "DELETE" })
  }

  // Notes
  async getNotes() {
    return this.request<Note[]>("/notes")
  }

  async getNote(id: string) {
    return this.request<Note>(`/notes/${id}`)
  }

  async createNote(data: Partial<Note>) {
    return this.request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateNote(id: string, data: Partial<Note>) {
    return this.request<Note>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteNote(id: string) {
    return this.request<void>(`/notes/${id}`, { method: "DELETE" })
  }

  // Chat
  async getChats() {
    return this.request<Chat[]>("/chats")
  }

  async getChat(id: string) {
    return this.request<Chat>(`/chats/${id}`)
  }

  async getMessages(chatId: string, page?: number) {
    const params = page ? `?page=${page}` : ""
    return this.request<PaginatedResponse<Message>>(`/chats/${chatId}/messages${params}`)
  }

  async sendMessage(chatId: string, content: string, type: "text" | "image" | "file" = "text") {
    return this.request<Message>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, type }),
    })
  }

  async createChat(data: { name?: string; type: "group" | "direct"; memberIds: string[] }) {
    return this.request<Chat>("/chats", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Users
  async getUsers(query?: { search?: string; status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams()
    if (query?.search) params.set("search", query.search)
    if (query?.status) params.set("status", query.status)
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())
    
    const queryString = params.toString()
    const response = await this.request<{ data: User[]; total: number; page: number; limit: number }>(
      `/users${queryString ? `?${queryString}` : ""}`
    )
    
    // Return data array from paginated response
    return response.data || []
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(data: { name: string; email: string; password: string; phone?: string; roleIds?: string[] }) {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: Partial<User> & { roleIds?: string[] }) {
    return this.request<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    })
  }

  async inviteUser(email: string, roleIds?: string[]) {
    return this.request<{ message: string }>("/auth/invite", {
      method: "POST",
      body: JSON.stringify({ email, roleIds }),
    })
  }

  async verifyInviteToken(token: string) {
    return this.request<{ email: string; inviterName: string; roles: Array<{ id: string; name: string; displayName: string }> }>(
      `/auth/verify-invite?token=${encodeURIComponent(token)}`
    )
  }

  async acceptInvite(data: { token: string; password: string; name: string; phone?: string }) {
    return this.request<{ message: string; user: User }>("/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Notifications
  async getNotifications() {
    return this.request<Notification[]>("/notifications")
  }

  async markNotificationRead(id: string) {
    return this.request<void>(`/notifications/${id}/read`, { method: "POST" })
  }

  async markAllNotificationsRead() {
    return this.request<void>("/notifications/read-all", { method: "POST" })
  }

  // Reports
  async exportReport(request: ReportExportRequest) {
    return this.request<{ jobId: string; downloadUrl?: string }>("/reports/export", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  async getReportJobStatus(jobId: string) {
    return this.request<{ status: "pending" | "processing" | "completed" | "failed"; downloadUrl?: string }>(
      `/reports/job/${jobId}`,
    )
  }

  // Search
  async search(query: string) {
    return this.request<{
      users: User[]
      projects: Project[]
      tasks: Task[]
    }>(`/search?q=${encodeURIComponent(query)}`)
  }

  // Roles
  async getRoles() {
    return this.request<RoleDefinition[]>("/roles")
  }

  async getRole(id: string) {
    return this.request<RoleDefinition>(`/roles/${id}`)
  }

  async getAvailablePermissions() {
    return this.request<{ permissions: string[] }>("/roles/permissions")
  }

  async createRole(data: {
    name: string
    displayName: string
    description?: string
    color?: string
    permissions: string[]
  }) {
    return this.request<RoleDefinition>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateRole(
    id: string,
    data: {
      name?: string
      displayName?: string
      description?: string
      color?: string
      permissions?: string[]
    }
  ) {
    return this.request<RoleDefinition>(`/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async updateRolePermissions(id: string, permissions: string[]) {
    return this.request<RoleDefinition>(`/roles/${id}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    })
  }

  async deleteRole(id: string) {
    return this.request<void>(`/roles/${id}`, {
      method: "DELETE",
    })
  }

  // ==================== Admin API ====================
  
  // System Settings
  async getSystemSettings() {
    return this.request<SystemSetting[]>("/admin/settings")
  }

  async getPublicSettings() {
    return this.request<SystemSetting[]>("/admin/settings/public")
  }

  async getSystemSetting(key: string) {
    return this.request<SystemSetting>(`/admin/settings/${key}`)
  }

  async updateSystemSetting(key: string, data: { value: string; description?: string; isPublic?: boolean }) {
    return this.request<SystemSetting>(`/admin/settings/${key}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Activity Logs
  async getActivityLogs(query?: ActivityLogQuery) {
    const params = new URLSearchParams()
    if (query?.userId) params.set("userId", query.userId)
    if (query?.action) params.set("action", query.action)
    if (query?.entityType) params.set("entityType", query.entityType)
    if (query?.startDate) params.set("startDate", query.startDate)
    if (query?.endDate) params.set("endDate", query.endDate)
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())

    const queryString = params.toString()
    return this.request<PaginatedResponse<ActivityLog>>(
      `/admin/activity-logs${queryString ? `?${queryString}` : ""}`
    )
  }

  async clearActivityLogs(days: number = 90) {
    return this.request<{ deleted: number }>(`/admin/activity-logs/cleanup?days=${days}`, {
      method: "DELETE",
    })
  }

  // Dashboard & Statistics
  async getDashboardStats() {
    return this.request<DashboardStats>("/admin/dashboard/stats")
  }

  async getUserActivityStats(days: number = 30) {
    return this.request<UserActivityStat[]>(`/admin/dashboard/user-activity?days=${days}`)
  }

  async getRecentActivity(limit: number = 20) {
    return this.request<ActivityLog[]>(`/admin/dashboard/recent-activity?limit=${limit}`)
  }

  async getTopUsers(limit: number = 10) {
    return this.request<TopUser[]>(`/admin/dashboard/top-users?limit=${limit}`)
  }

  // System Health
  async getSystemHealth() {
    return this.request<SystemHealth>("/admin/health")
  }

  // Database Maintenance
  async performDatabaseCleanup() {
    return this.request<DatabaseCleanupResult>("/admin/maintenance/cleanup", {
      method: "POST",
    })
  }

  // User Management (Admin)
  async getAllAdminUsers(query?: {
    status?: string
    role?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (query?.status) params.set("status", query.status)
    if (query?.role) params.set("role", query.role)
    if (query?.search) params.set("search", query.search)
    if (query?.page) params.set("page", query.page.toString())
    if (query?.limit) params.set("limit", query.limit.toString())

    const queryString = params.toString()
    return this.request<PaginatedResponse<User>>(`/admin/users${queryString ? `?${queryString}` : ""}`)
  }

  async lockUser(userId: string) {
    return this.request<User>(`/admin/users/${userId}/lock`, {
      method: "PATCH",
    })
  }

  async unlockUser(userId: string) {
    return this.request<User>(`/admin/users/${userId}/unlock`, {
      method: "PATCH",
    })
  }

  async assignUserRoles(userId: string, roleIds: string[]) {
    return this.request<User>(`/admin/users/${userId}/roles`, {
      method: "PATCH",
      body: JSON.stringify({ roleIds }),
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
export default api
