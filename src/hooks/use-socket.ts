import { useEffect, useState, useCallback } from "react"
import { socketClient } from "@/lib/socket"
import { useAuthStore } from "@/stores/auth-store"
import type { Message, Task } from "@/types"

// Hook to manage socket connection
export function useSocket() {
  const { token, isAuthenticated } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only try to connect if backend is available
    if (isAuthenticated && token && process.env.NEXT_PUBLIC_SOCKET_URL) {
      try {
        socketClient.connect(token)
        setIsConnected(socketClient.isConnected())

        // Check connection status periodically
        const interval = setInterval(() => {
          setIsConnected(socketClient.isConnected())
        }, 1000)

        return () => {
          clearInterval(interval)
        }
      } catch (error) {
        // Silently fail if socket connection not available
        console.warn("[Socket] Connection not available, running in offline mode")
      }
    }
  }, [isAuthenticated, token])

  const disconnect = useCallback(() => {
    socketClient.disconnect()
    setIsConnected(false)
  }, [])

  return { isConnected, disconnect, socketClient }
}

// Hook for listening to new messages
export function useSocketMessages(chatId: string, onMessage?: (message: Message) => void) {
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isConnected || !chatId) return

    socketClient.joinChat(chatId)

    const unsubscribe = socketClient.onNewMessage(({ chatId: msgChatId, message }) => {
      if (msgChatId === chatId && onMessage) {
        onMessage(message)
      }
    })

    return () => {
      socketClient.leaveChat(chatId)
      unsubscribe()
    }
  }, [isConnected, chatId, onMessage])
}

// Hook for typing indicators
export function useSocketTyping(chatId: string) {
  const { isConnected } = useSocket()
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    if (!isConnected || !chatId) return

    const unsubscribeTyping = socketClient.onUserTyping(({ chatId: typingChatId, userId }) => {
      if (typingChatId === chatId) {
        setTypingUsers((prev) => [...new Set([...prev, userId])])
      }
    })

    const unsubscribeStopTyping = socketClient.onUserStopTyping(({ chatId: typingChatId, userId }) => {
      if (typingChatId === chatId) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId))
      }
    })

    return () => {
      unsubscribeTyping()
      unsubscribeStopTyping()
    }
  }, [isConnected, chatId])

  const startTyping = useCallback(() => {
    if (isConnected && chatId) {
      socketClient.startTyping(chatId)
    }
  }, [isConnected, chatId])

  const stopTyping = useCallback(() => {
    if (isConnected && chatId) {
      socketClient.stopTyping(chatId)
    }
  }, [isConnected, chatId])

  return { typingUsers, startTyping, stopTyping }
}

// Hook for task updates
export function useSocketTaskUpdates(onTaskUpdate?: (payload: { taskId: string; changes: Partial<Task> }) => void) {
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isConnected || !onTaskUpdate) return

    const unsubscribe = socketClient.onTaskUpdate(onTaskUpdate)

    return unsubscribe
  }, [isConnected, onTaskUpdate])
}

// Hook for project updates
export function useSocketProjectUpdates(onProjectUpdate?: (project: any) => void) {
  const { isConnected } = useSocket()

  useEffect(() => {
    if (!isConnected || !onProjectUpdate) return

    const unsubscribe = socketClient.on("project:updated", onProjectUpdate)

    return unsubscribe
  }, [isConnected, onProjectUpdate])
}

// Hook for user online status
export function useSocketUserStatus() {
  const { isConnected } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isConnected) return

    const unsubscribeOnline = socketClient.onUserOnline(({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]))
    })

    const unsubscribeOffline = socketClient.onUserOffline(({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })

    return () => {
      unsubscribeOnline()
      unsubscribeOffline()
    }
  }, [isConnected])

  return { onlineUsers: Array.from(onlineUsers) }
}

// Hook for notifications
export function useSocketNotifications() {
  const { isConnected } = useSocket()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = socketClient.onNotification(({ notification }) => {
      setNotifications((prev) => [...prev, notification])
    })

    return unsubscribe
  }, [isConnected])

  return notifications
}
