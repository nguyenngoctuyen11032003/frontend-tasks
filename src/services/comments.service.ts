import { useAuthStore } from "@/stores/auth-store"
import type { Comment } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ==================== DTOs ====================
export interface CreateCommentPayload {
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

// ==================== Helper Functions ====================
const getAuthToken = () => {
  const { token } = useAuthStore.getState()
  if (!token) {
    throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.")
  }
  return token
}

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// ==================== Comments API ====================
export class CommentsService {
  /**
   * Get all comments for a task
   */
  static async getComments(taskId: string): Promise<Comment[]> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Create a new comment on a task
   */
  static async createComment(
    taskId: string,
    payload: CreateCommentPayload
  ): Promise<Comment> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return handleResponse(response)
  }

  /**
   * Update an existing comment
   */
  static async updateComment(
    taskId: string,
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<Comment> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    return handleResponse(response)
  }

  /**
   * Delete a comment
   */
  static async deleteComment(taskId: string, commentId: string): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    await handleResponse(response)
  }

  /**
   * Add a reaction to a comment
   */
  static async addReaction(commentId: string, emoji: string): Promise<any> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/tasks/comments/${commentId}/reactions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      }
    )

    return handleResponse(response)
  }

  /**
   * Remove a reaction from a comment
   */
  static async removeReaction(
    commentId: string,
    reactionId: string
  ): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/tasks/comments/${commentId}/reactions/${reactionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    await handleResponse(response)
  }
}
