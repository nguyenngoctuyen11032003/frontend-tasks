import { useEffect, useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { useSocketNotifications } from "@/hooks/use-socket"
import { toast } from "sonner"
import type { Notification } from "@/types"

interface NotificationBadgeProps {
  count: number
}

/**
 * Hook to manage real-time notifications with Socket.io
 */
export function useNotifications() {
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Listen for new notifications from socket
  const socketNotifications = useSocketNotifications()

  useEffect(() => {
    if (socketNotifications.length > 0) {
      const newNotifications = socketNotifications.filter(
        (n) => !notifications.find((existing) => existing.id === n.id)
      )

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev])
        setUnreadCount((prev) => prev + newNotifications.length)

        // Show toast for the latest notification
        const latest = newNotifications[0]
        showNotificationToast(latest)

        // Invalidate notifications query
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
      }
    }
  }, [socketNotifications, queryClient, notifications])

  const showNotificationToast = (notification: Notification) => {
    const toastOptions = {
      description: notification.message,
      duration: 5000,
    }

    switch (notification.type) {
      case "success":
        toast.success(notification.title, toastOptions)
        break
      case "error":
        toast.error(notification.title, toastOptions)
        break
      case "warning":
        toast.warning(notification.title, toastOptions)
        break
      case "task_assigned":
      case "task_completed":
      case "comment":
      case "mention":
      case "deadline":
      case "project_added":
        toast.info(notification.title, toastOptions)
        break
      default:
        toast(notification.title, toastOptions)
    }
  }

  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Update cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
    },
    [queryClient]
  )

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)

    // Update cache
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
  }, [queryClient])

  const deleteNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
    },
    [queryClient]
  )

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  const { unreadCount } = useNotifications()
  return unreadCount
}
