"use client"

import { useState } from "react"
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
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    return true
  })

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
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-7 text-xs"
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="h-7 text-xs"
          >
            Chưa đọc ({unreadCount})
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
                  onClick={() => markAsRead(notification.id)}
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
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
