import type { Tag } from "@/types"
import { useAuthStore } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface CreateTagDto {
  name: string
  color: string
}

export class TagsService {
  /**
   * Get all tags
   */
  static async getTags(): Promise<Tag[]> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tags`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tags")
    }

    return response.json()
  }

  /**
   * Get tag by ID
   */
  static async getTagById(id: string): Promise<Tag> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tags/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tag")
    }

    return response.json()
  }

  /**
   * Create new tag
   */
  static async createTag(data: CreateTagDto): Promise<Tag> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create tag")
    }

    return response.json()
  }

  /**
   * Update tag
   */
  static async updateTag(id: string, data: Partial<CreateTagDto>): Promise<Tag> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tags/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update tag")
    }

    return response.json()
  }

  /**
   * Delete tag
   */
  static async deleteTag(id: string): Promise<void> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tags/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete tag")
    }
  }

  /**
   * Add tag to project
   */
  static async addTagToProject(projectId: string, tagId: string): Promise<void> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/projects/${projectId}/tags/${tagId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to add tag to project")
    }
  }

  /**
   * Remove tag from project
   */
  static async removeTagFromProject(projectId: string, tagId: string): Promise<void> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/projects/${projectId}/tags/${tagId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to remove tag from project")
    }
  }

  /**
   * Add tag to task
   */
  static async addTagToTask(taskId: string, tagId: string): Promise<void> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tasks/${taskId}/tags/${tagId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to add tag to task")
    }
  }

  /**
   * Remove tag from task
   */
  static async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_URL}/tasks/${taskId}/tags/${tagId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to remove tag from task")
    }
  }
}
