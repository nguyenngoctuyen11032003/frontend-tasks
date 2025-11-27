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
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Đã xảy ra lỗi")
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
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
  async getUsers() {
    return this.request<User[]>("/users")
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`)
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/users/${id}`, {
      method: "PATCH",
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
}

export const api = new ApiClient(API_BASE_URL)
export default api
