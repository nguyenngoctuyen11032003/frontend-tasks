"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { Calendar, MessageSquare, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PriorityBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  className?: string
}

export const TaskCard = memo(function TaskCard({ task, onClick, isDragging, className }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `Quá hạn ${Math.abs(diffDays)} ngày`
    if (diffDays === 0) return "Hôm nay"
    if (diffDays === 1) return "Ngày mai"
    if (diffDays <= 7) return `Còn ${diffDays} ngày`
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
  }

  const isOverdue = useMemo(
    () => new Date(task.dueDate) < new Date() && task.status !== "done",
    [task.dueDate, task.status]
  )

  const checklistProgress = useMemo(() => {
    const completed = task.checklist.filter((c) => c.completed).length
    const total = task.checklist.length
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }, [task.checklist])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "rotate-3 shadow-lg",
        className,
      )}
    >
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="mb-2 font-medium leading-tight line-clamp-2">{task.title}</h4>

      {/* Priority */}
      <div className="mb-3">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Checklist progress */}
      {task.checklist.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Tiến độ</span>
            <span>
              {checklistProgress.completed}/{checklistProgress.total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${checklistProgress.percentage}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((assignee) => (
            <Avatar key={assignee.id} className="h-7 w-7 border-2 border-card">
              <AvatarImage src={assignee.avatarUrl || "/placeholder.svg"} alt={assignee.name} />
              <AvatarFallback className="text-xs">{getInitials(assignee.name)}</AvatarFallback>
            </Avatar>
          ))}
          {task.assignees.length > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {task.commentsCount}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {task.attachments.length}
            </span>
          )}
          <span className={cn("flex items-center gap-1", isOverdue && "text-destructive")}>
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </motion.div>
  )
})
