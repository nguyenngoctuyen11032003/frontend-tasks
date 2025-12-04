import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Notification } from "@/types"
import { NotificationsService, type QueryNotificationParams } from "@/services/notifications.service"
import { socketClient } from "@/lib/socket"
import { toast } from "sonner"

interface NotificationsState {
  // State
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalNotifications: number
  pageSize: number
  currentFilter: "all" | "unread"

  // Actions
  fetchNotifications: (params?: QueryNotificationParams) => Promise<void>
  fetchNotificationsByFilter: (filter: "all" | "unread") => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markMultipleAsRead: (ids: string[]) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  setCurrentPage: (page: number) => void
  subscribeToSocket: () => void
  reset: () => void
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalNotifications: 0,
  pageSize: 20,
  currentFilter: "all" as const,
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch notifications with pagination and filters
      fetchNotifications: async (params?: QueryNotificationParams) => {
        set({ loading: true, error: null })
        try {
          const result = await NotificationsService.getNotifications({
            ...params,
            page: params?.page || get().currentPage,
            limit: params?.limit || get().pageSize,
          })

          // Calculate unread count if fetching all notifications
          const unreadCount = params?.read === undefined 
            ? result.items.filter((n) => !n.read).length 
            : get().unreadCount

          set({
            notifications: result.items,
            totalPages: result.totalPages,
            totalNotifications: result.total,
            currentPage: result.page,
            unreadCount,
            loading: false,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể tải thông báo"
          set({ error: errorMessage, loading: false })
          toast.error(errorMessage)
        }
      },

      // Fetch notifications by filter (all or unread)
      fetchNotificationsByFilter: async (filter: "all" | "unread") => {
        set({ loading: true, error: null, currentFilter: filter })
        try {
          console.log(`[Store] fetchNotificationsByFilter: filter=${filter}`)
          // Đảo ngược logic: 'unread' là tất cả, 'all' là chỉ chưa đọc
          const result = await NotificationsService.getNotifications({
            read: filter === "all" ? false : undefined,
            page: 1,
            limit: get().pageSize,
          })
          console.log(`[Store] API response: items=${result.items.length}, total=${result.total}`, result.items)

          set({
            notifications: result.items,
            totalPages: result.totalPages,
            totalNotifications: result.total,
            currentPage: result.page,
            loading: false,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể tải thông báo"
          console.error(`[Store] fetchNotificationsByFilter error:`, errorMessage)
          set({ error: errorMessage, loading: false })
          toast.error(errorMessage)
        }
      },

      // Fetch unread count
      fetchUnreadCount: async () => {
        try {
          const count = await NotificationsService.getUnreadCount()
          set({ unreadCount: count })
        } catch (error) {
          console.error("Failed to fetch unread count:", error)
        }
      },

      // Mark single notification as read
      markAsRead: async (id: string) => {
        try {
          console.log(`[Store] markAsRead: id=${id}, currentFilter=${get().currentFilter}`)
          await NotificationsService.markAsRead(id)
          // Update local state immediately based on current filter
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id)
            const isUnread = notification && !notification.read
            
            console.log(`[Store] Notification found: ${notification ? 'yes' : 'no'}, isUnread=${isUnread}`)
            
            // If viewing unread filter, remove the notification
            if (state.currentFilter === "unread") {
              console.log(`[Store] On unread filter - removing notification`)
              return {
                unreadCount: Math.max(0, state.unreadCount - 1),
                notifications: state.notifications.filter((n) => n.id !== id),
              }
            } else {
              // If viewing all, just mark as read
              console.log(`[Store] On all filter - marking read, keeping in list`)
              return {
                unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
                notifications: state.notifications.map((n) =>
                  n.id === id ? { ...n, read: true } : n
                ),
              }
            }
          })
          toast.success("Đã đánh dấu là đã đọc")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể đánh dấu"
          console.error(`[Store] markAsRead error:`, errorMessage)
          toast.error(errorMessage)
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          await NotificationsService.markAllAsRead()
          set((state) => ({
            unreadCount: 0,
            notifications:
              state.currentFilter === "unread"
                ? []
                : state.notifications.map((n) => ({ ...n, read: true })),
          }))
          toast.success("Đã đánh dấu tất cả là đã đọc")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể đánh dấu"
          toast.error(errorMessage)
        }
      },

      // Mark multiple notifications as read
      markMultipleAsRead: async (ids: string[]) => {
        try {
          await NotificationsService.markMultipleAsRead(ids)
          set((state) => ({
            notifications: state.notifications.map((n) =>
              ids.includes(n.id) ? { ...n, read: true } : n
            ),
          }))
          get().fetchUnreadCount()
          toast.success("Đã đánh dấu những thông báo được chọn")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể đánh dấu"
          toast.error(errorMessage)
        }
      },

      // Delete single notification
      deleteNotification: async (id: string) => {
        try {
          await NotificationsService.deleteNotification(id)
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id)
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: notification && !notification.read 
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            }
          })
          toast.success("Đã xóa thông báo")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể xóa thông báo"
          toast.error(errorMessage)
        }
      },

      // Delete all notifications
      deleteAllNotifications: async () => {
        try {
          // Only delete notifications that are read
          const readNotifications = get().notifications.filter((n) => n.read)
          if (readNotifications.length === 0) {
            toast.info("Không có thông báo đã đọc để xóa")
            return
          }
          for (const notification of readNotifications) {
            await NotificationsService.deleteNotification(notification.id)
          }
          set((state) => ({
            notifications: state.notifications.filter((n) => !n.read),
            totalNotifications: state.notifications.filter((n) => !n.read).length,
            // unreadCount remains unchanged
          }))
          toast.success("Đã xóa tất cả thông báo đã đọc")
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Không thể xóa thông báo"
          toast.error(errorMessage)
        }
      },

      // Add notification to beginning of list (for real-time)
      addNotification: (notification: Notification) => {
        set((state) => {
          // Only add if not read, or if on "all" filter
          // For unread filter, only add unread notifications
          const shouldAdd =
            state.currentFilter === "all" ||
            (state.currentFilter === "unread" && !notification.read)

          return {
            notifications: shouldAdd
              ? [notification, ...state.notifications]
              : state.notifications,
            totalNotifications: state.totalNotifications + 1,
            unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
          }
        })
      },

      // Remove notification from list
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          totalNotifications: Math.max(0, state.totalNotifications - 1),
        }))
      },

      // Update notification in list
      updateNotification: (id: string, updates: Partial<Notification>) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        }))
      },

      // Set current page for pagination
      setCurrentPage: (page: number) => {
        set({ currentPage: page })
      },

      // Reset store to initial state
      reset: () => set(initialState),

      // Subscribe to socket for real-time notifications
      subscribeToSocket: () => {
        try {
          console.log(`[Store] Setting up socket subscribers`)
          socketClient.onNotification((notification: any) => {
            console.log(`[Store] Received notification event:`, notification)
            const notif = notification.notification || notification
            get().addNotification(notif)
          })
          
          // Listen to unread count updates
          socketClient.onUnreadCount((count: number) => {
            console.log(`[Store] Received unread-count event: count=${count}`)
            set({ unreadCount: count })
          })
        } catch (error) {
          console.error("Failed to subscribe to socket notifications:", error)
        }
      },
    }),
    {
      name: "notifications-store",
    },
  ),
)
