"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  Calendar,
  FolderPlus,
  AtSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotificationsStore } from "@/stores/notifications-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [isInitialized, setIsInitialized] = useState(false)

  // Store subscriptions
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const loading = useNotificationsStore((state) => state.loading)
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications)
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount)
  const fetchNotificationsByFilter = useNotificationsStore((state) => state.fetchNotificationsByFilter)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const deleteNotification = useNotificationsStore((state) => state.deleteNotification)
  const subscribeToSocket = useNotificationsStore((state) => state.subscribeToSocket)
  const deleteAllNotifications = useNotificationsStore((state) => state.deleteAllNotifications)

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchNotifications()
      fetchUnreadCount()
      subscribeToSocket()
      setIsInitialized(true)
    }
  }, [isInitialized, fetchNotifications, fetchUnreadCount, subscribeToSocket])

  // Fetch notifications when dropdown opens or filter changes
  useEffect(() => {
    if (isOpen) {
      console.log(`[Component] Tab changed or popover opened: filter=${filter}`)
      fetchNotificationsByFilter(filter)
    }
  }, [isOpen, filter, fetchNotificationsByFilter])

  // Đảm bảo tab 'Chưa đọc' chỉ hiển thị notification chưa đọc
  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "task_assigned":
        return <CheckSquare className="h-4 w-4 text-blue-600" />
      case "task_completed":
        return <CheckCheck className="h-4 w-4 text-green-600" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "mention":
        return <AtSign className="h-4 w-4 text-orange-600" />
      case "deadline":
        return <Calendar className="h-4 w-4 text-red-600" />
      case "project_added":
        return <FolderPlus className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      })
    } catch {
      return dateString
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Thông báo</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
                disabled={loading}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="h-7 text-xs"
          >
            Chưa đọc ({notifications.filter(n => !n.read).length})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-7 text-xs"
          >
            Tất cả
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={cn(
                    "relative p-4 border-b hover:bg-accent transition-colors cursor-pointer",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                  )}
                  onClick={() => {
                    // Nếu đang ở tab 'Chưa đọc', mark as read và remove khỏi list
                    // Nếu ở tab 'Tất cả', chỉ mark as read (không remove)
                    if (filter === "unread") {
                      markAsRead(notification.id)
                    } else {
                      if (!notification.read) markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium leading-tight">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

        {filteredNotifications.length > 0 && (
          <div className="p-2 border-t">
            {filter === "unread" ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={markAllAsRead}
                disabled={loading}
              >
                Đọc tất cả thông báo
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={deleteAllNotifications}
                disabled={loading}
              >
                Xóa tất cả thông báo
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
