import { useAuthStore } from "@/stores/auth-store"
import type { Task, ChecklistItem, TaskReminder, Comment, Attachment } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ==================== DTOs ====================
export interface CreateTaskPayload {
  title: string
  description: string
  status?: "todo" | "in_progress" | "review" | "done"
  priority?: "low" | "medium" | "high" | "urgent"
  dueDate?: string
  estimatedHours?: number
  projectId: string
  assignedById?: string
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface QueryTaskParams {
  search?: string
  status?: string
  priority?: string
  projectId?: string
  assigneeId?: string
  createdById?: string
  tagId?: string
  dueDateFrom?: string
  dueDateTo?: string
  overdue?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface TasksResponse {
  data: Task[]
  total: number
  page: number
  limit: number
}

export interface TaskStatistics {
  total: number
  byStatus: {
    todo: number
    inProgress: number
    review: number
    done: number
  }
  overdue: number
}

export interface CreateChecklistItemPayload {
  title: string
  completed?: boolean
}

export interface UpdateChecklistItemPayload {
  title?: string
  completed?: boolean
}

export interface CreateReminderPayload {
  reminderDate: string
  message: string
}

export interface CreateCommentPayload {
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export interface AddReactionPayload {
  emoji: string
}

// ==================== Service ====================
class TasksService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    const state = useAuthStore.getState()
    return state.token
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    if (error.message) {
      throw new Error(error.message)
    }
    throw new Error("An error occurred while processing your request")
  }

  // ==================== CRUD Operations ====================
  async getTasks(params?: QueryTaskParams): Promise<TasksResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.search) queryParams.append("search", params.search)
      if (params?.status) queryParams.append("status", params.status)
      if (params?.priority) queryParams.append("priority", params.priority)
      if (params?.projectId) queryParams.append("projectId", params.projectId)
      if (params?.assigneeId) queryParams.append("assigneeId", params.assigneeId)
      if (params?.createdById) queryParams.append("createdById", params.createdById)
      if (params?.tagId) queryParams.append("tagId", params.tagId)
      if (params?.dueDateFrom) queryParams.append("dueDateFrom", params.dueDateFrom)
      if (params?.dueDateTo) queryParams.append("dueDateTo", params.dueDateTo)
      if (params?.overdue) queryParams.append("overdue", params.overdue)
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.limit) queryParams.append("limit", params.limit.toString())
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)

      const url = new URL(`${API_BASE_URL}/tasks`)
      url.search = queryParams.toString()

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      this.handleError(error)
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Assignees Management ====================
  async assignUsers(taskId: string, userIds: string[]): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/assignees`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ userIds }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeAssignee(taskId: string, assigneeId: string): Promise<Task> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/assignees/${assigneeId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Tags Management ====================
  async addTags(taskId: string, tagIds: string[]): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/tags`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ tagIds }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeTag(taskId: string, tagId: string): Promise<Task> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/tags/${tagId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Checklist Management ====================
  async addChecklistItem(
    taskId: string,
    payload: CreateChecklistItemPayload
  ): Promise<ChecklistItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/checklist`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateChecklistItem(
    taskId: string,
    itemId: string,
    payload: UpdateChecklistItemPayload
  ): Promise<ChecklistItem> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/checklist/${itemId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeChecklistItem(taskId: string, itemId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/checklist/${itemId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Reminders Management ====================
  async addReminder(
    taskId: string,
    payload: CreateReminderPayload
  ): Promise<TaskReminder> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/reminders`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeReminder(taskId: string, reminderId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/reminders/${reminderId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Comments Management ====================
  async getTaskComments(taskId: string, params?: Partial<QueryTaskParams>): Promise<Comment[]> {
    try {
      const queryString = new URLSearchParams()
      if (params?.page) queryString.append("page", params.page.toString())
      if (params?.limit) queryString.append("limit", params.limit.toString())
      if (params?.sortBy) queryString.append("sortBy", params.sortBy)
      if (params?.sortOrder) queryString.append("sortOrder", params.sortOrder)

      const url = `${API_BASE_URL}/tasks/${taskId}/comments${queryString.toString() ? `?${queryString.toString()}` : ""}`

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async addComment(
    taskId: string,
    payload: CreateCommentPayload
  ): Promise<Comment> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async updateComment(
    taskId: string,
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<Comment> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeComment(taskId: string, commentId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Reactions Management ====================
  async addReaction(
    commentId: string,
    payload: AddReactionPayload
  ): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/comments/${commentId}/reactions`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async removeReaction(commentId: string, reactionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/comments/${commentId}/reactions/${reactionId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  // ==================== Statistics ====================
  async getStatistics(projectId?: string): Promise<TaskStatistics> {
    try {
      const url = new URL(`${API_BASE_URL}/tasks/statistics`)
      if (projectId) url.searchParams.append("projectId", projectId)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }
}

export const tasksService = new TasksService()
