import { useAuthStore } from "@/stores/auth-store"
import type { ActivityLog } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

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

  return response.json()
}

// ==================== Activity Logs API ====================
export class ActivityLogsService {
  /**
   * Get activity logs for a task
   */
  static async getTaskActivityLogs(
    taskId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/activity-logs?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse(response)
  }

  /**
   * Get activity logs for a project
   */
  static async getProjectActivityLogs(
    projectId: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/activity-logs?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse(response)
  }

  /**
   * Format action text for display
   */
  static formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      CREATE: "đã tạo",
      UPDATE: "đã cập nhật",
      DELETE: "đã xóa",
      ASSIGN: "đã phân công",
      UNASSIGN: "đã hủy phân công",
      ADD_COMMENT: "đã bình luận",
      ADD_ATTACHMENT: "đã đính kèm file",
      REMOVE_ATTACHMENT: "đã xóa file",
      ADD_TAG: "đã thêm tag",
      REMOVE_TAG: "đã xóa tag",
      STATUS_CHANGE: "đã thay đổi trạng thái",
      PRIORITY_CHANGE: "đã thay đổi độ ưu tiên",
    }
    return actionMap[action] || action.toLowerCase().replace("_", " ")
  }

  /**
   * Format entity type for display
   */
  static formatEntityType(entityType: string): string {
    const typeMap: Record<string, string> = {
      TASK: "công việc",
      PROJECT: "dự án",
      COMMENT: "bình luận",
      USER: "người dùng",
    }
    return typeMap[entityType] || entityType.toLowerCase()
  }
}
