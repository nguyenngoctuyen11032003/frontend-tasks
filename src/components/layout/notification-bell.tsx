"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, Settings, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSocketNotifications } from "@/hooks/use-socket"
import type { Notification } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Công việc mới được giao",
    message: "Nguyễn Văn A đã giao cho bạn công việc: Thiết kế UI trang chủ",
    type: "task_assigned",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: "/tasks",
  },
  {
    id: "notif-2",
    title: "Bình luận mới",
    message: "Trần Thị B đã bình luận trong công việc: API Integration",
    type: "comment",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: "/tasks",
  },
  {
    id: "notif-3",
    title: "Deadline sắp đến",
    message: "Công việc 'Review code' sẽ hết hạn trong 2 giờ nữa",
    type: "deadline",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    link: "/tasks",
  },
  {
    id: "notif-4",
    title: "Dự án mới",
    message: "Bạn đã được thêm vào dự án: E-commerce Platform",
    type: "project_added",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: "/projects",
  },
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [preferences, setPreferences] = useState({
    taskAssigned: true,
    taskCompleted: true,
    comment: true,
    mention: true,
    deadline: true,
    projectAdded: true,
  })

  // Listen for real-time notifications
  const socketNotifications = useSocketNotifications()

  useEffect(() => {
    if (socketNotifications.length > 0) {
      const newNotif = socketNotifications[socketNotifications.length - 1]
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          read: false,
          createdAt: new Date().toISOString(),
          link: newNotif.link,
        },
        ...prev,
      ])
      toast.info(newNotif.title, { description: newNotif.message })
    }
  }, [socketNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("Đã đánh dấu tất cả là đã đọc")
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success("Đã xóa thông báo")
  }

  const clearAll = () => {
    setNotifications([])
    toast.success("Đã xóa tất cả thông báo")
  }

  const getTimeAgo = (dateString: string) => {
    const now = Date.now()
    const date = new Date(dateString).getTime()
    const diff = now - date

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    return `${days} ngày trước`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋"
      case "task_completed":
        return "✅"
      case "comment":
        return "💬"
      case "mention":
        return "👤"
      case "deadline":
        return "⏰"
      case "project_added":
        return "📁"
      default:
        return "🔔"
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Thông báo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[380px] p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <h4 className="font-semibold">Thông báo</h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="mr-1 h-3 w-3" />
                Đã đọc
              </Button>
              <Sheet open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cài đặt thông báo</SheetTitle>
                    <SheetDescription>
                      Quản lý các loại thông báo bạn muốn nhận
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-assigned">Công việc được giao</Label>
                      <Switch
                        id="task-assigned"
                        checked={preferences.taskAssigned}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, taskAssigned: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task-completed">Công việc hoàn thành</Label>
                      <Switch
                        id="task-completed"
                        checked={preferences.taskCompleted}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, taskCompleted: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comment">Bình luận mới</Label>
                      <Switch
                        id="comment"
                        checked={preferences.comment}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, comment: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mention">Được nhắc đến (@)</Label>
                      <Switch
                        id="mention"
                        checked={preferences.mention}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, mention: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="deadline">Deadline sắp đến</Label>
                      <Switch
                        id="deadline"
                        checked={preferences.deadline}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, deadline: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="project">Dự án mới</Label>
                      <Switch
                        id="project"
                        checked={preferences.projectAdded}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, projectAdded: checked }))
                        }
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Không có thông báo nào
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "group relative flex gap-3 border-b p-3 transition-colors hover:bg-accent/50",
                      !notification.read && "bg-accent/20"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={clearAll}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Xóa tất cả
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
