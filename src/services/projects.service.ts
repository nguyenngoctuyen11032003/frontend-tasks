import { useAuthStore } from "@/stores/auth-store"
import type { Project, Tag } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface CreateProjectPayload {
  name: string
  description: string
  color?: string
  status?: "active" | "on-hold" | "completed" | "archived"
  startDate?: string
  endDate?: string
  deadline?: string
  progress?: number
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {}

export interface QueryProjectParams {
  search?: string
  status?: string
  memberId?: string
  tagId?: string
  createdById?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface ProjectsResponse {
  data: Project[]
  total: number
  page: number
  limit: number
}

export interface ProjectStatistics {
  projectId: string
  totalTasks: number
  completedTasks: number
  todoTasks: number
  inProgressTasks: number
  pendingTasks: number
  onHoldTasks: number
}

export interface ActivityLog {
  id: string
  projectId: string
  userId: string
  action: string
  description: string
  createdAt: string
}

class ProjectsService {
  private getAuthToken(): string | null {
    // Access the store state directly without using the hook
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

  async getProjects(params?: QueryProjectParams): Promise<ProjectsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.search) queryParams.append("search", params.search)
      if (params?.status) queryParams.append("status", params.status)
      if (params?.memberId) queryParams.append("memberId", params.memberId)
      if (params?.tagId) queryParams.append("tagId", params.tagId)
      if (params?.createdById) queryParams.append("createdById", params.createdById)
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.limit) queryParams.append("limit", params.limit.toString())
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)

      const url = new URL(`${API_BASE_URL}/projects`)
      url.search = queryParams.toString()

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Không thể tải danh sách dự án (${response.status})`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching projects:", error)
      this.handleError(error)
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
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

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
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

  async updateProject(
    id: string,
    payload: UpdateProjectPayload
  ): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
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

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
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

  async addMembers(
    projectId: string,
    userIds: string[]
  ): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
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

  async removeMember(
    projectId: string,
    memberId: string
  ): Promise<Project> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/members/${memberId}`,
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

  async addTags(projectId: string, tagIds: string[]): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tags`, {
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

  async removeTag(projectId: string, tagId: string): Promise<Project> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/tags/${tagId}`,
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

  async getAllStatistics(): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/statistics`,
        {
          method: "GET",
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

  async getStatistics(projectId: string): Promise<ProjectStatistics> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/statistics`,
        {
          method: "GET",
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

  async getActivityLogs(
    projectId: string,
    limit?: number
  ): Promise<ActivityLog[]> {
    try {
      const url = new URL(`${API_BASE_URL}/projects/${projectId}/activity-logs`)
      if (limit) url.searchParams.append("limit", limit.toString())

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

export const projectsService = new ProjectsService()
