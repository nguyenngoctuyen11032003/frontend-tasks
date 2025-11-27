"use client"

import { motion } from "framer-motion"
import { FolderOpen, FileText, CheckSquare, MessageCircle, Users, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateType = "projects" | "tasks" | "notes" | "chat" | "team" | "reports"

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const emptyStateConfig: Record<
  EmptyStateType,
  { icon: typeof FolderOpen; defaultTitle: string; defaultDescription: string }
> = {
  projects: {
    icon: FolderOpen,
    defaultTitle: "Chưa có dự án nào",
    defaultDescription: "Bắt đầu bằng cách tạo dự án đầu tiên của bạn",
  },
  tasks: {
    icon: CheckSquare,
    defaultTitle: "Chưa có công việc nào",
    defaultDescription: "Tạo công việc mới để bắt đầu theo dõi tiến độ",
  },
  notes: {
    icon: FileText,
    defaultTitle: "Chưa có ghi chú nào",
    defaultDescription: "Tạo ghi chú để lưu lại ý tưởng của bạn",
  },
  chat: {
    icon: MessageCircle,
    defaultTitle: "Chưa có cuộc trò chuyện nào",
    defaultDescription: "Bắt đầu cuộc trò chuyện mới với đồng nghiệp",
  },
  team: {
    icon: Users,
    defaultTitle: "Chưa có thành viên nào",
    defaultDescription: "Mời thành viên vào nhóm của bạn",
  },
  reports: {
    icon: BarChart,
    defaultTitle: "Chưa có báo cáo nào",
    defaultDescription: "Tạo báo cáo để theo dõi hiệu suất",
  },
}

export function EmptyState({ type, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title || config.defaultTitle}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description || config.defaultDescription}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </motion.div>
  )
}
