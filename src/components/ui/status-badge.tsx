import { cn } from "@/lib/utils"
import type { TaskStatus, TaskPriority } from "@/types"

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: "Chờ xử lý",
    className: "bg-secondary text-secondary-foreground",
  },
  in_progress: {
    label: "Đang thực hiện",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  review: {
    label: "Đang review",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  done: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: {
    label: "Thấp",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  medium: {
    label: "Trung bình",
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  high: {
    label: "Cao",
    className: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  urgent: {
    label: "Khẩn cấp",
    className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
