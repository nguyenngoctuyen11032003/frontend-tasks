import { useAuthStore } from "@/stores/auth-store"
import type { Chat, Message, PaginatedResponse } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ==================== DTOs ====================
export interface CreateChatDto {
  name?: string
  type: "group" | "direct"
  participantIds: string[]
}

export interface UpdateChatDto {
  name?: string
}

export interface QueryChatDto {
  page?: number
  limit?: number
  search?: string
  type?: "group" | "direct"
}

export interface CreateMessageDto {
  chatId: string
  content: string
  type?: "text" | "image" | "file"
  attachmentUrls?: string[]
}

export interface QueryMessageDto {
  chatId: string
  page?: number
  limit?: number
}

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

// ==================== Chat API ====================
export class ChatService {
  /**
   * Get all chats for current user
   * GET /chats
   */
  static async getChats(query?: QueryChatDto): Promise<PaginatedResponse<Chat>> {
    const token = getAuthToken()
    const params = new URLSearchParams()
    
    if (query?.page) params.append("page", query.page.toString())
    if (query?.limit) params.append("limit", query.limit.toString())
    if (query?.search) params.append("search", query.search)
    if (query?.type) params.append("type", query.type)

    const queryString = params.toString()
    const url = `${API_BASE_URL}/chats${queryString ? `?${queryString}` : ""}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<PaginatedResponse<Chat>>(response)
  }

  /**
   * Get single chat by ID
   * GET /chats/:id
   */
  static async getChat(id: string): Promise<Chat> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Chat>(response)
  }

  /**
   * Create new chat
   * POST /chats
   */
  static async createChat(data: CreateChatDto): Promise<Chat> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<Chat>(response)
  }

  /**
   * Update chat
   * PATCH /chats/:id
   */
  static async updateChat(id: string, data: UpdateChatDto): Promise<Chat> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<Chat>(response)
  }

  /**
   * Delete chat
   * DELETE /chats/:id
   */
  static async deleteChat(id: string): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse<void>(response)
  }

  /**
   * Add participants to chat
   * POST /chats/:id/participants
   */
  static async addParticipants(
    chatId: string,
    participantIds: string[]
  ): Promise<Chat> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/participants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participantIds }),
    })

    return handleResponse<Chat>(response)
  }

  /**
   * Remove participant from chat
   * DELETE /chats/:id/participants/:participantId
   */
  static async removeParticipant(
    chatId: string,
    participantId: string
  ): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/chats/${chatId}/participants/${participantId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return handleResponse<void>(response)
  }

  /**
   * Get messages for a chat
   * GET /chats/messages/list
   */
  static async getMessages(query: QueryMessageDto): Promise<PaginatedResponse<Message>> {
    const token = getAuthToken()
    const params = new URLSearchParams()
    
    params.append("chatId", query.chatId)
    if (query.page) params.append("page", query.page.toString())
    if (query.limit) params.append("limit", query.limit.toString())

    const queryString = params.toString()
    const url = `${API_BASE_URL}/chats/messages/list?${queryString}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<PaginatedResponse<Message>>(response)
  }

  /**
   * Send message
   * POST /chats/messages
   */
  static async sendMessage(data: CreateMessageDto): Promise<Message> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<Message>(response)
  }

  /**
   * Mark message as read
   * POST /chats/messages/:messageId/read
   */
  static async markAsRead(messageId: string): Promise<Message> {
    const token = getAuthToken()

    const response = await fetch(
      `${API_BASE_URL}/chats/messages/${messageId}/read`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    return handleResponse<Message>(response)
  }

  /**
   * Get unread count
   * GET /chats/unread-count
   */
  static async getUnreadCount(): Promise<{ unreadCount: number }> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/chats/unread-count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<{ unreadCount: number }>(response)
  }
}

// Export singleton instance if needed
export const chatService = ChatService
