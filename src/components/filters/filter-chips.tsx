"use client"

/**
 * Filter Chips Component
 * Display active filters as removable chips
 */

import React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFilters } from "@/hooks/use-filters"
import type { TaskFilters, ProjectFilters } from "@/lib/filters"
import type { TaskStatus, TaskPriority } from "@/types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface FilterChipsProps {
  type: "task" | "project"
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Cần làm",
  in_progress: "Đang làm",
  review: "Đang xem xét",
  done: "Hoàn thành",
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
}

const PROJECT_STATUS_LABELS: Record<"active" | "completed" | "archived" | "on-hold", string> = {
  active: "Đang hoạt động",
  completed: "Hoàn thành",
  archived: "Lưu trữ",
  "on-hold": "Tạm dừng",
}

export function FilterChips({ type }: FilterChipsProps) {
  const {
    taskFilters,
    setTaskFilters,
    clearTaskFilters,
    projectFilters,
    setProjectFilters,
    clearProjectFilters,
    hasActiveTaskFilters,
    hasActiveProjectFilters,
  } = useFilters()

  const filters = type === "task" ? taskFilters : projectFilters
  const hasActiveFilters = type === "task" ? hasActiveTaskFilters : hasActiveProjectFilters

  if (!hasActiveFilters) return null

  const handleRemoveStatus = (status: string) => {
    if (type === "task") {
      const taskStatus = status as TaskStatus
      setTaskFilters({
        ...taskFilters,
        status: (taskFilters.status || []).filter((s) => s !== taskStatus),
      })
    } else {
      const projectStatus = status as "active" | "completed" | "archived" | "on-hold"
      setProjectFilters({
        ...projectFilters,
        status: (projectFilters.status || []).filter((s) => s !== projectStatus),
      })
    }
  }

  const handleRemovePriority = (priority: TaskPriority) => {
    if (type === "task") {
      setTaskFilters({
        ...taskFilters,
        priority: (taskFilters.priority || []).filter((p) => p !== priority),
      })
    }
  }

  const handleRemoveDateRange = (field: "start" | "end") => {
    if (type === "task") {
      setTaskFilters({
        ...taskFilters,
        dateRange: {
          ...(taskFilters.dateRange || { start: null, end: null }),
          [field]: null,
        },
      })
    } else {
      setProjectFilters({
        ...projectFilters,
        dateRange: {
          ...(projectFilters.dateRange || { start: null, end: null }),
          [field]: null,
        },
      })
    }
  }

  const handleClearAll = () => {
    if (type === "task") {
      clearTaskFilters()
    } else {
      clearProjectFilters()
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 md:p-4 bg-muted/50 rounded-lg border">
      <span className="text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">Đang lọc:</span>

      {/* Task Status Chips */}
      {type === "task" &&
        (taskFilters.status || []).map((status) => (
          <Badge key={status} variant="secondary" className="gap-1">
            {STATUS_LABELS[status]}
            <button
              onClick={() => handleRemoveStatus(status)}
              className="ml-1 hover:bg-background rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      {/* Project Status Chips */}
      {type === "project" &&
        (projectFilters.status || []).map((status) => (
          <Badge key={status} variant="secondary" className="gap-1">
            {PROJECT_STATUS_LABELS[status]}
            <button
              onClick={() => handleRemoveStatus(status)}
              className="ml-1 hover:bg-background rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      {/* Priority Chips */}
      {type === "task" &&
        (taskFilters.priority || []).map((priority) => (
          <Badge key={priority} variant="secondary" className="gap-1">
            Độ ưu tiên: {PRIORITY_LABELS[priority]}
            <button
              onClick={() => handleRemovePriority(priority)}
              className="ml-1 hover:bg-background rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      {/* Date Range Chips */}
      {filters.dateRange?.start && (
        <Badge variant="secondary" className="gap-1">
          Từ: {format(filters.dateRange.start, "dd/MM/yyyy", { locale: vi })}
          <button
            onClick={() => handleRemoveDateRange("start")}
            className="ml-1 hover:bg-background rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.dateRange?.end && (
        <Badge variant="secondary" className="gap-1">
          Đến: {format(filters.dateRange.end, "dd/MM/yyyy", { locale: vi })}
          <button
            onClick={() => handleRemoveDateRange("end")}
            className="ml-1 hover:bg-background rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Progress Range Chip (Projects only) */}
      {type === "project" && projectFilters.progressRange && (
        <Badge variant="secondary" className="gap-1">
          Tiến độ: {projectFilters.progressRange.min}% - {projectFilters.progressRange.max}%
          <button
            onClick={() =>
              setProjectFilters({
                ...projectFilters,
                progressRange: undefined,
              })
            }
            className="ml-1 hover:bg-background rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Clear All Button */}
      <Button variant="ghost" size="sm" onClick={handleClearAll} className="ml-auto text-xs md:text-sm">
        <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
        <span className="hidden sm:inline">Xóa tất cả</span>
      </Button>
    </div>
  )
}
