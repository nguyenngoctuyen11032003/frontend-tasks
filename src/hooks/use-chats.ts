import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Chat, Message } from "@/types"
import { toast } from "sonner"

// Query keys
export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  messages: (chatId: string) => [...chatKeys.all, "messages", chatId] as const,
}

// Hooks
export function useChats(query?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: async () => {
      const response = await api.getChats(query)
      console.log('[useChats] API response:', response)
      return response
    },
  })
}

export function useChat(id: string) {
  return useQuery({
    queryKey: chatKeys.detail(id),
    queryFn: () => api.getChat(id),
    enabled: !!id,
  })
}

export function useMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(chatId),
    queryFn: ({ pageParam = 1 }) => api.getMessages(chatId, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    enabled: !!chatId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, content, type }: { chatId: string; content: string; type?: "text" | "image" | "file" }) =>
      api.sendMessage(chatId, content, type),
    // Optimistic update
    onMutate: async ({ chatId, content, type }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(chatId) })

      const previousMessages = queryClient.getQueryData(chatKeys.messages(chatId))

      // Optimistically add message
      const optimisticMessage: Partial<Message> = {
        id: `temp-${Date.now()}`,
        chatId,
        content,
        type: type || "text",
        createdAt: new Date().toISOString(),
        readBy: [],
      }

      queryClient.setQueryData(chatKeys.messages(chatId), (old: any) => {
        if (!old || !old.pages) return old
        const newPages = [...old.pages]
        const lastPage = { ...newPages[newPages.length - 1] }
        lastPage.items = [...lastPage.items, optimisticMessage]
        newPages[newPages.length - 1] = lastPage
        return { ...old, pages: newPages }
      })

      return { previousMessages }
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(chatKeys.messages(variables.chatId), context.previousMessages)
      }
      toast.error(error.message || "Gửi tin nhắn thất bại")
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.chatId) })
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
    },
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string; type: "group" | "direct"; participantIds: string[] }) => api.createChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
      toast.success("Tạo cuộc trò chuyện thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo cuộc trò chuyện thất bại")
    },
  })
}
