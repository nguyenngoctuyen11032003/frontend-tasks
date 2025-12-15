import { useAuthStore } from "@/stores/auth-store"
import type { Notification } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not configured')
}

// ==================== DTOs ====================
export interface QueryNotificationParams {
  read?: boolean
  type?: string
  page?: number
  limit?: number
}

export interface NotificationResponse {
  items: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface StatisticsResponse {
  total: number
  unread: number
  read: number
  byType: Record<string, number>
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

// ==================== Notifications API ====================
export class NotificationsService {
  /**
   * Get all notifications for current user
   */
  static async getNotifications(
    params?: QueryNotificationParams
  ): Promise<NotificationResponse> {
    const token = getAuthToken()
    const searchParams = new URLSearchParams()

    if (params?.read !== undefined) {
      searchParams.append("read", String(params.read))
    }
    if (params?.type) {
      searchParams.append("type", params.type)
    }
    if (params?.page) {
      searchParams.append("page", String(params.page))
    }
    if (params?.limit) {
      searchParams.append("limit", String(params.limit))
    }

    const queryString = searchParams.toString()
    const url = `${API_BASE_URL}/notifications${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    const result = await handleResponse(response)
    return result?.count || 0
  }

  /**
   * Get notification statistics
   */
  static async getStatistics(): Promise<StatisticsResponse> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/statistics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Get single notification by id
   */
  static async getNotification(id: string): Promise<Notification> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    await handleResponse(response)
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(ids: string[]): Promise<Notification[]> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/read-multiple`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    })

    return handleResponse(response)
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await handleResponse(response)
  }

  /**
   * Delete all notifications
   */
  static async deleteAllNotifications(): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await handleResponse(response)
  }
}
