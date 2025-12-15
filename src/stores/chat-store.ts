import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { ChatService } from "@/services/chat.service"
import type { Chat, Message, PaginatedResponse } from "@/types"
import type { CreateChatDto, CreateMessageDto, QueryChatDto, QueryMessageDto, UpdateChatDto } from "@/services/chat.service"

interface ChatState {
  // Data
  chats: Chat[]
  currentChat: Chat | null
  messages: Message[]
  
  // Pagination
  currentPage: number
  totalPages: number
  totalItems: number
  
  // Loading states
  loading: boolean
  messagesLoading: boolean
  sendingMessage: boolean
  
  // Error state
  error: string | null
  
  // Actions - Chats
  fetchChats: (query?: QueryChatDto) => Promise<void>
  fetchChat: (id: string) => Promise<void>
  createChat: (data: CreateChatDto) => Promise<Chat>
  updateChat: (id: string, data: UpdateChatDto) => Promise<Chat>
  deleteChat: (id: string) => Promise<void>
  setCurrentChat: (chat: Chat | null) => void
  
  // Actions - Messages
  fetchMessages: (query: QueryMessageDto) => Promise<void>
  sendMessage: (data: CreateMessageDto) => Promise<Message>
  markMessageAsRead: (messageId: string) => Promise<void>
  getUnreadCount: () => Promise<number>
  
  // Helpers
  clearError: () => void
  reset: () => void
}

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  messagesLoading: false,
  sendingMessage: false,
  error: null,
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Fetch all chats
        fetchChats: async (query?: QueryChatDto) => {
          set({ loading: true, error: null })
          try {
            const response = await ChatService.getChats(query)
            set({
              chats: response.items || [],
              currentPage: response.page || 1,
              totalPages: response.totalPages || 1,
              totalItems: response.total || 0,
              loading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch chats"
            set({ error: message, loading: false, chats: [] })
            throw error
          }
        },

        // Fetch single chat
        fetchChat: async (id: string) => {
          set({ loading: true, error: null })
          try {
            const chat = await ChatService.getChat(id)
            set({
              currentChat: chat,
              loading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch chat"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Create new chat
        createChat: async (data: CreateChatDto) => {
          set({ loading: true, error: null })
          try {
            const newChat = await ChatService.createChat(data)
            set((state) => ({
              chats: [newChat, ...state.chats],
              loading: false,
            }))
            return newChat
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create chat"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Update chat
        updateChat: async (id: string, data: UpdateChatDto) => {
          set({ loading: true, error: null })
          try {
            const updatedChat = await ChatService.updateChat(id, data)
            set((state) => ({
              chats: state.chats.map((c) => (c.id === id ? updatedChat : c)),
              currentChat: state.currentChat?.id === id ? updatedChat : state.currentChat,
              loading: false,
            }))
            return updatedChat
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update chat"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Delete chat
        deleteChat: async (id: string) => {
          set({ loading: true, error: null })
          try {
            await ChatService.deleteChat(id)
            set((state) => ({
              chats: state.chats.filter((c) => c.id !== id),
              currentChat: state.currentChat?.id === id ? null : state.currentChat,
              loading: false,
            }))
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete chat"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Set current chat
        setCurrentChat: (chat: Chat | null) => {
          set({ currentChat: chat, messages: [] })
        },

        // Fetch messages for a chat
        fetchMessages: async (query: QueryMessageDto) => {
          set({ messagesLoading: true, error: null })
          try {
            const response = await ChatService.getMessages(query)
            set({
              messages: response.items || [],
              messagesLoading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch messages"
            set({ error: message, messagesLoading: false, messages: [] })
            throw error
          }
        },

        // Send message
        sendMessage: async (data: CreateMessageDto) => {
          set({ sendingMessage: true, error: null })
          try {
            const newMessage = await ChatService.sendMessage(data)
            set((state) => ({
              messages: [...state.messages, newMessage],
              sendingMessage: false,
            }))
            return newMessage
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send message"
            set({ error: message, sendingMessage: false })
            throw error
          }
        },

        // Mark message as read
        markMessageAsRead: async (messageId: string) => {
          try {
            await ChatService.markAsRead(messageId)
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to mark message as read"
            set({ error: message })
            throw error
          }
        },

        // Get unread count
        getUnreadCount: async () => {
          try {
            const result = await ChatService.getUnreadCount()
            return result.unreadCount
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to get unread count"
            set({ error: message })
            throw error
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: "chat-storage",
        partialize: (state) => ({
          // Only persist current chat, not the full list
          currentChat: state.currentChat,
        }),
      }
    )
  )
)
