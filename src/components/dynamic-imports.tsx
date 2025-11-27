"use client"

import dynamic from "next/dynamic"
import { ComponentType } from "react"

/**
 * Dynamically imported components for better performance
 * These are heavy components that should be loaded on-demand
 */

// Charts (Recharts is heavy ~150KB)
export const TaskCompletionChart = dynamic(
  () => import("@/components/analytics/task-completion-chart").then((mod) => ({ default: mod.TaskCompletionChart })),
  {
    loading: () => (
      <div className="flex h-[350px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải biểu đồ...</div>
      </div>
    ),
    ssr: false,
  }
)

export const ProjectProgressChart = dynamic(
  () => import("@/components/analytics/project-progress-chart").then((mod) => ({ default: mod.ProjectProgressChart })),
  {
    loading: () => (
      <div className="flex h-[350px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải biểu đồ...</div>
      </div>
    ),
    ssr: false,
  }
)

export const TeamProductivityChart = dynamic(
  () => import("@/components/analytics/team-productivity-chart").then((mod) => ({ default: mod.TeamProductivityChart })),
  {
    loading: () => (
      <div className="flex h-[350px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải biểu đồ...</div>
      </div>
    ),
    ssr: false,
  }
)

// Rich text editor - commented out (not yet implemented)
// export const RichTextEditor = dynamic(
//   () => import("@/components/editor/rich-text-editor").then((mod) => mod.RichTextEditor),
//   {
//     loading: () => (
//       <div className="min-h-[400px] flex items-center justify-center border rounded-md">
//         <div className="text-muted-foreground">Đang tải trình soạn thảo...</div>
//       </div>
//     ),
//     ssr: false,
//   }
// )

// Kanban board (heavy drag & drop)
export const KanbanBoard = dynamic(
  () => import("@/components/tasks/kanban-board").then((mod) => ({ default: mod.KanbanBoard })),
  {
    loading: () => (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-muted-foreground">Đang tải bảng Kanban...</div>
      </div>
    ),
    ssr: false,
  }
)

// File uploader (heavy with image compression)
export const FileUploader = dynamic(
  () => import("@/components/upload/file-uploader").then((mod) => ({ default: mod.FileUploader })),
  {
    loading: () => (
      <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-md">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    ),
    ssr: false,
  }
)

// Calendar (react-day-picker is heavy)
export const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => ({ default: mod.Calendar })),
  {
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải lịch...</div>
      </div>
    ),
    ssr: false,
  }
)

// Export dialog (heavy with multiple formats)
export const ExportDialog = dynamic(
  () => import("@/components/export/export-dialog").then((mod) => ({ default: mod.ExportDialog })),
  {
    loading: () => null, // Dialog không hiển thị cho đến khi loaded
    ssr: false,
  }
)

// Command palette (cmdk with search)
export const CommandPalette = dynamic(
  () => import("@/components/search/command-palette").then((mod) => ({ default: mod.CommandPalette })),
  {
    loading: () => null,
    ssr: false,
  }
)

/**
 * Utility type for dynamic component props
 */
export type DynamicComponentProps<T> = T extends ComponentType<infer P> ? P : never
