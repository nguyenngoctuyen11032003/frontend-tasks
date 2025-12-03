/**
 * Sorting System
 * Provides utilities for sorting tasks, projects, and other entities
 */

import type { Task, Project, User, TaskStatus, TaskPriority } from "@/types"

export type TaskSortField = 
  | "title" 
  | "priority" 
  | "dueDate" 
  | "status" 
  | "createdAt" 
  | "updatedAt"
  | "assignee"

export type ProjectSortField = 
  | "name" 
  | "progress" 
  | "deadline" 
  | "status" 
  | "createdAt" 
  | "updatedAt"
  | "members"

export type SortDirection = "asc" | "desc"

export interface SortConfig<T = TaskSortField | ProjectSortField> {
  field: T
  direction: SortDirection
}

export interface SavedSortPreference {
  type: "task" | "project"
  config: SortConfig
  updatedAt: string
}

/**
 * Priority values for sorting
 */
const PRIORITY_VALUES: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

/**
 * Status values for sorting tasks
 */
const TASK_STATUS_VALUES: Record<TaskStatus, number> = {
  todo: 1,
  in_progress: 2,
  review: 3,
  done: 4,
}

/**
 * Status values for sorting projects
 */
const PROJECT_STATUS_VALUES: Record<"active" | "completed" | "archived" | "on-hold", number> = {
  active: 1,
  "on-hold": 2,
  completed: 3,
  archived: 4,
}

/**
 * Sort Manager
 * Handles sorting logic and preference management
 */
export class SortManager {
  private static STORAGE_KEY = "sort_preferences"

  /**
   * Sort tasks based on field and direction
   */
  static sortTasks(tasks: Task[], config: SortConfig): Task[] {
    const sorted = [...tasks]
    const { field, direction } = config
    const multiplier = direction === "asc" ? 1 : -1

    sorted.sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "title":
          comparison = a.title.localeCompare(b.title, "vi")
          break

        case "priority":
          comparison = PRIORITY_VALUES[a.priority] - PRIORITY_VALUES[b.priority]
          break

        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break

        case "status":
          comparison = TASK_STATUS_VALUES[a.status] - TASK_STATUS_VALUES[b.status]
          break

        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break

        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break

        case "assignee":
          const aAssignee = a.assignees[0]?.name || ""
          const bAssignee = b.assignees[0]?.name || ""
          comparison = aAssignee.localeCompare(bAssignee, "vi")
          break

        default:
          comparison = 0
      }

      return comparison * multiplier
    })

    return sorted
  }

  /**
   * Sort projects based on field and direction
   */
  static sortProjects(projects: Project[], config: SortConfig): Project[] {
    const sorted = [...projects]
    const { field, direction } = config
    const multiplier = direction === "asc" ? 1 : -1

    sorted.sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "name":
          comparison = a.name.localeCompare(b.name, "vi")
          break

        case "progress":
          comparison = a.progress - b.progress
          break

        case "deadline":
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
          comparison = aDeadline - bDeadline
          break

        case "status":
          comparison = PROJECT_STATUS_VALUES[a.status] - PROJECT_STATUS_VALUES[b.status]
          break

        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break

        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break

        case "members":
          comparison = a.members.length - b.members.length
          break

        default:
          comparison = 0
      }

      return comparison * multiplier
    })

    return sorted
  }

  /**
   * Get saved sort preference
   */
  static getSortPreference(type: "task" | "project"): SortConfig | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${type}`)
      if (!stored) return null

      const preference = JSON.parse(stored) as SavedSortPreference
      return preference.config
    } catch (error) {
      console.error("Failed to load sort preference:", error)
      return null
    }
  }

  /**
   * Save sort preference
   */
  static saveSortPreference(
    type: "task" | "project",
    config: SortConfig
  ): void {
    if (typeof window === "undefined") return

    try {
      const preference: SavedSortPreference = {
        type,
        config,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(`${this.STORAGE_KEY}_${type}`, JSON.stringify(preference))
    } catch (error) {
      console.error("Failed to save sort preference:", error)
    }
  }

  /**
   * Clear sort preference
   */
  static clearSortPreference(type: "task" | "project"): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${type}`)
    } catch (error) {
      console.error("Failed to clear sort preference:", error)
    }
  }

  /**
   * Get default sort config
   */
  static getDefaultSort(type: "task" | "project"): SortConfig {
    if (type === "task") {
      return {
        field: "dueDate" as TaskSortField,
        direction: "asc",
      }
    } else {
      return {
        field: "deadline" as ProjectSortField,
        direction: "asc",
      }
    }
  }

  /**
   * Toggle sort direction
   */
  static toggleDirection(direction: SortDirection): SortDirection {
    return direction === "asc" ? "desc" : "asc"
  }

  /**
   * Get sort field label
   */
  static getSortFieldLabel(field: TaskSortField | ProjectSortField, type: "task" | "project"): string {
    const labels: Record<string, string> = {
      // Task fields
      title: "Tên công việc",
      priority: "Độ ưu tiên",
      dueDate: "Hạn hoàn thành",
      status: "Trạng thái",
      assignee: "Người thực hiện",
      createdAt: "Ngày tạo",
      updatedAt: "Ngày cập nhật",
      // Project fields
      name: "Tên dự án",
      progress: "Tiến độ",
      deadline: "Hạn chót",
      members: "Số thành viên",
    }

    return labels[field] || field
  }

  /**
   * Get available sort fields
   */
  static getSortFields(type: "task" | "project"): Array<{ value: string; label: string }> {
    if (type === "task") {
      return [
        { value: "title", label: "Tên công việc" },
        { value: "priority", label: "Độ ưu tiên" },
        { value: "dueDate", label: "Hạn hoàn thành" },
        { value: "status", label: "Trạng thái" },
        { value: "assignee", label: "Người thực hiện" },
        { value: "createdAt", label: "Ngày tạo" },
        { value: "updatedAt", label: "Ngày cập nhật" },
      ]
    } else {
      return [
        { value: "name", label: "Tên dự án" },
        { value: "progress", label: "Tiến độ" },
        { value: "deadline", label: "Hạn chót" },
        { value: "status", label: "Trạng thái" },
        { value: "members", label: "Số thành viên" },
        { value: "createdAt", label: "Ngày tạo" },
        { value: "updatedAt", label: "Ngày cập nhật" },
      ]
    }
  }
}
