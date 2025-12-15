import { useAuthStore } from "@/stores/auth-store"
import type {
  ActivityLog,
  ActivityLogQuery,
  DashboardStats,
  UserActivityStat,
  TopUser,
  SystemHealth,
  DatabaseCleanupResult,
  PaginatedResponse,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ==================== Helper Functions ====================
const getAuthToken = () => {
  const { token } = useAuthStore.getState()
  if (!token) {
    throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.")
  }
  return token
}

const handleResponse = async <T>(response: Response): Promise<T> => {
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
    return null as T
  }

  return response.json()
}

// ==================== Dashboard/Admin API ====================
export class DashboardService {
  /**
   * Get dashboard statistics
   * GET /admin/dashboard/stats
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<DashboardStats>(response)
  }

  /**
   * Get user activity statistics
   * GET /admin/dashboard/user-activity
   */
  static async getUserActivityStats(days: number = 30): Promise<UserActivityStat[]> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/admin/dashboard/user-activity?days=${days}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse<UserActivityStat[]>(response)
  }

  /**
   * Get recent activity logs
   * GET /admin/dashboard/recent-activity
   */
  static async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/admin/dashboard/recent-activity?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse<ActivityLog[]>(response)
  }

  /**
   * Get top users by activity
   * GET /admin/dashboard/top-users
   */
  static async getTopUsers(limit: number = 10): Promise<TopUser[]> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/admin/dashboard/top-users?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse<TopUser[]>(response)
  }

  /**
   * Get activity logs with filters
   * GET /admin/activity-logs
   */
  static async getActivityLogs(query?: ActivityLogQuery): Promise<PaginatedResponse<ActivityLog>> {
    const token = getAuthToken()
    const params = new URLSearchParams()

    if (query?.userId) params.append("userId", query.userId)
    if (query?.action) params.append("action", query.action)
    if (query?.entityType) params.append("entityType", query.entityType)
    if (query?.startDate) params.append("startDate", query.startDate)
    if (query?.endDate) params.append("endDate", query.endDate)
    if (query?.page) params.append("page", query.page.toString())
    if (query?.limit) params.append("limit", query.limit.toString())

    const queryString = params.toString()
    const url = `${API_BASE_URL}/admin/activity-logs${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<PaginatedResponse<ActivityLog>>(response)
  }

  /**
   * Clear old activity logs
   * DELETE /admin/activity-logs/cleanup
   */
  static async clearActivityLogs(days: number = 90): Promise<{ deleted: number }> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/admin/activity-logs/cleanup?days=${days}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse<{ deleted: number }>(response)
  }

  /**
   * Get system health status
   * GET /admin/health
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/admin/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<SystemHealth>(response)
  }

  /**
   * Perform database cleanup
   * POST /admin/maintenance/cleanup
   */
  static async performDatabaseCleanup(): Promise<DatabaseCleanupResult> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/admin/maintenance/cleanup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<DatabaseCleanupResult>(response)
  }
}

// Export singleton instance
export const dashboardService = DashboardService
