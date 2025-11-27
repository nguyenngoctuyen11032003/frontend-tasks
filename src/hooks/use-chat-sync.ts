"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { useSocketMessages } from "@/hooks/use-socket"
import { socketClient } from "@/lib/socket"
import type { Message } from "@/types"

/**
 * Sync chat messages from socket to React Query cache
 */
export function useChatSync(chatId: string) {
  const queryClient = useQueryClient()

  useSocketMessages(chatId, (message: Message) => {
    // Update messages in cache
    queryClient.setQueryData(queryKeys.chat.messages(chatId), (oldMessages: Message[] = []) => {
      // Check if message already exists
      if (oldMessages.some((m) => m.id === message.id)) {
        return oldMessages
      }
      return [...oldMessages, message]
    })

    // Invalidate chat room to update last message
    queryClient.invalidateQueries({ queryKey: queryKeys.chat.room(chatId) })
  })
}

/**
 * Send message through socket
 */
export function useEmitMessage(chatId: string) {
  const emitMessage = (content: string) => {
    if (socketClient.isConnected()) {
      socketClient.sendMessage(chatId, content)
    }
  }

  return emitMessage
}

/**
 * Combined hook for chat real-time collaboration
 */
export function useChatCollaboration(chatId: string) {
  useChatSync(chatId)
  const emitMessage = useEmitMessage(chatId)

  return { emitMessage }
}
