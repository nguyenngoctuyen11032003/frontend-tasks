import { useAuthStore } from "@/stores/auth-store"
import type { Note } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface CreateNotePayload {
  title: string
  content: string
  projectId?: string
  tagIds?: string[]
  sharedWithUserIds?: string[]
}

export interface UpdateNotePayload {
  title?: string
  content?: string
  projectId?: string
}

export interface QueryNoteParams {
  search?: string
  tagId?: string
  isPinned?: boolean
  isShared?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface NotesResponse {
  items: Note[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface NoteStatistics {
  total: number
  pinned: number
  shared: number
  tagged: number
}

class NotesService {
  private getAuthToken(): string | null {
    // Access the store state directly without using the hook
    if (typeof window === "undefined") return null
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
    throw new Error("Đã xảy ra lỗi khi xử lý yêu cầu của bạn")
  }

  async getNotes(params?: QueryNoteParams): Promise<NotesResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.search) queryParams.append("search", params.search)
      if (params?.tagId) queryParams.append("tagId", params.tagId)
      if (params?.isPinned !== undefined) queryParams.append("isPinned", params.isPinned.toString())
      if (params?.isShared !== undefined) queryParams.append("isShared", params.isShared.toString())
      if (params?.page) queryParams.append("page", params.page.toString())
      if (params?.limit) queryParams.append("limit", params.limit.toString())
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy)
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder)

      const url = new URL(`${API_BASE_URL}/notes`)
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
          errorData.message || `Không thể tải danh sách ghi chú (${response.status})`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching notes:", error)
      this.handleError(error)
    }
  }

  async getNote(id: string): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ghi chú không tồn tại")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      this.handleError(error)
    }
  }

  async createNote(payload: CreateNotePayload): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
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

  async updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
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

  async deleteNote(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
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

  async duplicateNote(id: string): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/duplicate`, {
        method: "POST",
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

  async togglePin(id: string): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/toggle-pin`, {
        method: "PATCH",
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

  async shareNote(
    id: string,
    userIds: string[]
  ): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/share`, {
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

  async unshareNote(id: string, userId: string): Promise<Note> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notes/${id}/share/${userId}`,
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

  async addTag(id: string, tagId: string): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}/tags/${tagId}`, {
        method: "POST",
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

  async removeTag(id: string, tagId: string): Promise<Note> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notes/${id}/tags/${tagId}`,
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

  async getStatistics(): Promise<NoteStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/statistics`, {
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

export const notesService = new NotesService()
