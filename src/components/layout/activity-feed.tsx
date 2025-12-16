"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckSquare,
  MessageSquare,
  UserPlus,
  FileText,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  FolderPlus,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useSocketTaskUpdates } from "@/hooks/use-socket"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "task_created" | "task_completed" | "task_updated" | "comment" | "user_added" | "project_created" | "note_created"
  user: {
    id: string
    name: string
    avatar?: string
  }
  action: string
  target?: string
  timestamp: string
  metadata?: any
}

const mockActivities: Activity[] = [
  {
    id: "act-1",
    type: "task_completed",
    user: { id: "1", name: "Nguyễn Văn A", avatar: "/placeholder.svg" },
    action: "đã hoàn thành",
    target: "Thiết kế UI trang chủ",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "act-2",
    type: "comment",
    user: { id: "2", name: "Trần Thị B", avatar: "/placeholder.svg" },
    action: "đã bình luận trong",
    target: "API Integration",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "act-3",
    type: "task_created",
    user: { id: "3", name: "Lê Văn C", avatar: "/placeholder.svg" },
    action: "đã tạo công việc",
    target: "Review code module Auth",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "act-4",
    type: "user_added",
    user: { id: "1", name: "Nguyễn Văn A", avatar: "/placeholder.svg" },
    action: "đã thêm",
    target: "Phạm Thị D vào dự án E-commerce",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "act-5",
    type: "project_created",
    user: { id: "4", name: "Hoàng Văn E", avatar: "/placeholder.svg" },
    action: "đã tạo dự án",
    target: "Mobile App Redesign",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
]

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [filter, setFilter] = useState<"all" | "tasks" | "projects" | "comments">("all")
  
  // Listen to real-time task updates
  const taskUpdates = useSocketTaskUpdates()

  useEffect(() => {
    // Add real-time updates to activity feed
    if (taskUpdates !== undefined && taskUpdates !== null) {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: "task_updated",
        user: {
          id: "current",
          name: "Bạn",
        },
        action: "đã cập nhật",
        target: "công việc",
        timestamp: new Date().toISOString(),
      }
      setActivities((prev) => [newActivity, ...prev].slice(0, 50))
    }
  }, [taskUpdates])

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

  const getActivityIcon = (type: Activity["type"]) => {
    const iconClass = "h-4 w-4"
    switch (type) {
      case "task_created":
        return <CheckSquare className={cn(iconClass, "text-blue-500")} />
      case "task_completed":
        return <CheckCircle2 className={cn(iconClass, "text-green-500")} />
      case "task_updated":
        return <Edit className={cn(iconClass, "text-amber-500")} />
      case "comment":
        return <MessageSquare className={cn(iconClass, "text-purple-500")} />
      case "user_added":
        return <UserPlus className={cn(iconClass, "text-cyan-500")} />
      case "project_created":
        return <FolderPlus className={cn(iconClass, "text-indigo-500")} />
      case "note_created":
        return <FileText className={cn(iconClass, "text-pink-500")} />
      default:
        return <Clock className={iconClass} />
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true
    if (filter === "tasks") return activity.type.includes("task")
    if (filter === "projects") return activity.type.includes("project")
    if (filter === "comments") return activity.type === "comment"
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="space-y-3 pb-4">
        <div>
          <h3 className="font-semibold text-lg">Hoạt động gần đây</h3>
          <p className="text-sm text-muted-foreground">
            Theo dõi mọi thay đổi trong dự án
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "tasks" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("tasks")}
          >
            Công việc
          </Button>
          <Button
            variant={filter === "projects" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("projects")}
          >
            Dự án
          </Button>
          <Button
            variant={filter === "comments" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("comments")}
          >
            Bình luận
          </Button>
        </div>
      </div>

      <Separator />

      {/* Activity List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-4 py-4">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3 group"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index < filteredActivities.length - 1 && (
                    <div className="w-px h-full bg-border mt-2 flex-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                        {activity.target && (
                          <span className="font-medium text-foreground"> {activity.target}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(activity.timestamp)}
                        </span>
                        <Badge variant="outline" className="h-5 px-1.5">
                          {getActivityIcon(activity.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredActivities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có hoạt động nào
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
