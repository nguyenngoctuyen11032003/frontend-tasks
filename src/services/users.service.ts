import type { User } from "@/types"
import { useAuthStore } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export class UsersService {
  /**
   * Get all users with optional search and role filter
   */
  static async getUsers(params?: {
    search?: string
    role?: string
    page?: number
    limit?: number
  }): Promise<{ data: User[]; total: number }> {
    const token = useAuthStore.getState().token
    const queryParams = new URLSearchParams()
    
    if (params?.search) queryParams.append("search", params.search)
    if (params?.role) queryParams.append("role", params.role)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const response = await fetch(`${API_URL}/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  }

  /**
   * Update user information
   */
  static async updateUser(
    id: string,
    data: Partial<User>
  ): Promise<User> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update user")
    }

    return response.json()
  }

  /**
   * Get users for a specific project
   */
  static async getProjectUsers(projectId: string): Promise<User[]> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/projects/${projectId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch project members")
    }

    return response.json()
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(query: string): Promise<User[]> {
    if (!query.trim()) return []
    
    const result = await this.getUsers({ search: query, limit: 20 })
    return result.data
  }
}
