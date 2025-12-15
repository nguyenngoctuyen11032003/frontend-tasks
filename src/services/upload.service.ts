import { useAuthStore } from "@/stores/auth-store"
import type { Attachment } from "@/types"

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

  // Handle 204 No Content
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// ==================== Upload API ====================
export class UploadService {
  /**
   * Upload a single file
   */
  static async uploadFile(
    file: File,
    entityType: string,
    entityId: string
  ): Promise<Attachment> {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(
      `${API_BASE_URL}/upload/file?entityType=${entityType}&entityId=${entityId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    return handleResponse(response)
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[],
    entityType: string,
    entityId: string
  ): Promise<Attachment[]> {
    const token = getAuthToken()
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(
      `${API_BASE_URL}/upload/files?entityType=${entityType}&entityId=${entityId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )

    return handleResponse(response)
  }

  /**
   * Upload avatar
   */
  static async uploadAvatar(file: File): Promise<{ url: string }> {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    return handleResponse(response)
  }

  /**
   * Get user files
   */
  static async getUserFiles(limit: number = 50): Promise<Attachment[]> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/upload/files?limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Get file by ID
   */
  static async getFileById(fileId: string): Promise<Attachment> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/upload/files/${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Delete file
   */
  static async deleteFile(fileId: string): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/upload/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    await handleResponse(response)
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalSize: number
    fileCount: number
  }> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/upload/storage/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse(response)
  }

  /**
   * Download file (creates a download link)
   */
  static getDownloadUrl(fileUrl: string): string {
    // If it's already a full URL, return as is
    if (fileUrl.startsWith("http")) {
      return fileUrl
    }
    
    // Otherwise, prepend the base URL
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured")
    }
    const baseUrl = API_BASE_URL.replace("/api", "")
    return `${baseUrl}${fileUrl}`
  }
}
