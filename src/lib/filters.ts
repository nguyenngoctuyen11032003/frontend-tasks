/**
 * Advanced Filtering System
 * Provides utilities for filtering tasks, projects, and other entities
 */

import type { Task, Project, User, TaskStatus, TaskPriority } from "@/types"

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignees?: string[] // User IDs
  tags?: string[]
  dateRange?: DateRange
  projectId?: string
  search?: string
}

export interface ProjectFilters {
  status?: ("active" | "completed" | "archived" | "on-hold")[]
  members?: string[] // User IDs
  tags?: string[]
  dateRange?: DateRange
  progressRange?: {
    min: number
    max: number
  }
  search?: string
}

export interface FilterPreset {
  id: string
  name: string
  type: "task" | "project"
  filters: TaskFilters | ProjectFilters
  icon?: string
  color?: string
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export interface FilterStats {
  totalCount: number
  filteredCount: number
  filterRate: number // percentage
}

/**
 * Filter Manager
 * Handles filtering logic and preset management
 */
export class FilterManager {
  private static STORAGE_KEY = "filter_presets"

  /**
   * Filter tasks based on criteria
   */
  static filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
    let filtered = [...tasks]

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((task) => filters.status!.includes(task.status))
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((task) => filters.priority!.includes(task.priority))
    }

    // Filter by assignees
    if (filters.assignees && filters.assignees.length > 0) {
      filtered = filtered.filter((task) =>
        task.assignees.some((assignee) => filters.assignees!.includes(assignee.id))
      )
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((task) =>
        task.tags.some((tag) => filters.tags!.includes(tag.id))
      )
    }

    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter((task) => task.projectId === filters.projectId)
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter((task) => {
        const dueDate = new Date(task.dueDate)
        if (start && dueDate < start) return false
        if (end && dueDate > end) return false
        return true
      })
    }

    // Filter by search query
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  /**
   * Filter projects based on criteria
   */
  static filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
    let filtered = [...projects]

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((project) => filters.status!.includes(project.status))
    }

    // Filter by members
    if (filters.members && filters.members.length > 0) {
      filtered = filtered.filter((project) =>
        project.members.some((member: any) => filters.members!.includes(member.id || member))
      )
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((project) =>
        project.tags.some((tag) => filters.tags!.includes(tag.id))
      )
    }

    // Filter by progress range
    if (filters.progressRange) {
      const { min, max } = filters.progressRange
      filtered = filtered.filter(
        (project) => project.progress >= min && project.progress <= max
      )
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter((project) => {
        if (!project.deadline) return false
        const deadline = new Date(project.deadline)
        if (start && deadline < start) return false
        if (end && deadline > end) return false
        return true
      })
    }

    // Filter by search query
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  /**
   * Calculate filter statistics
   */
  static calculateStats<T>(total: T[], filtered: T[]): FilterStats {
    const totalCount = total.length
    const filteredCount = filtered.length
    const filterRate = totalCount > 0 ? (filteredCount / totalCount) * 100 : 0

    return {
      totalCount,
      filteredCount,
      filterRate: Math.round(filterRate),
    }
  }

  /**
   * Check if filters are active
   */
  static hasActiveFilters(filters: TaskFilters | ProjectFilters): boolean {
    const { search, dateRange, ...otherFilters } = filters

    // Check if any array filter has values
    const hasArrayFilters = Object.values(otherFilters).some(
      (value) => Array.isArray(value) && value.length > 0
    )

    // Check if date range is set
    const hasDateRange = dateRange && (dateRange.start !== null || dateRange.end !== null)

    // Check if search is set
    const hasSearch = search && search.trim() !== ""

    return hasArrayFilters || !!hasDateRange || !!hasSearch
  }

  /**
   * Clear all filters
   */
  static clearFilters(type: "task" | "project"): TaskFilters | ProjectFilters {
    if (type === "task") {
      return {
        status: [],
        priority: [],
        assignees: [],
        tags: [],
        dateRange: { start: null, end: null },
        projectId: undefined,
        search: "",
      }
    } else {
      return {
        status: [],
        members: [],
        tags: [],
        dateRange: { start: null, end: null },
        progressRange: undefined,
        search: "",
      }
    }
  }

  /**
   * Load filter presets from localStorage
   */
  static getPresets(): FilterPreset[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return this.getDefaultPresets()

      const presets = JSON.parse(stored) as FilterPreset[]
      return [...this.getDefaultPresets(), ...presets]
    } catch (error) {
      console.error("Failed to load filter presets:", error)
      return this.getDefaultPresets()
    }
  }

  /**
   * Save filter preset to localStorage
   */
  static savePreset(preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">): FilterPreset {
    if (typeof window === "undefined") {
      throw new Error("Cannot save preset in server environment")
    }

    const newPreset: FilterPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const presets = this.getPresets().filter((p) => !p.isDefault)
      presets.push(newPreset)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets))
      return newPreset
    } catch (error) {
      console.error("Failed to save filter preset:", error)
      throw error
    }
  }

  /**
   * Update existing preset
   */
  static updatePreset(
    id: string,
    updates: Partial<Omit<FilterPreset, "id" | "createdAt">>
  ): FilterPreset | null {
    if (typeof window === "undefined") return null

    try {
      const presets = this.getPresets().filter((p) => !p.isDefault)
      const index = presets.findIndex((p) => p.id === id)

      if (index === -1) return null

      presets[index] = {
        ...presets[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets))
      return presets[index]
    } catch (error) {
      console.error("Failed to update filter preset:", error)
      return null
    }
  }

  /**
   * Delete preset
   */
  static deletePreset(id: string): boolean {
    if (typeof window === "undefined") return false

    try {
      const presets = this.getPresets().filter((p) => !p.isDefault && p.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets))
      return true
    } catch (error) {
      console.error("Failed to delete filter preset:", error)
      return false
    }
  }

  /**
   * Get default filter presets
   */
  private static getDefaultPresets(): FilterPreset[] {
    return [
      {
        id: "default_my_tasks",
        name: "Công việc của tôi",
        type: "task",
        filters: {
          status: ["todo", "in_progress"],
        } as TaskFilters,
        icon: "User",
        color: "blue",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default_urgent_tasks",
        name: "Ưu tiên cao",
        type: "task",
        filters: {
          priority: ["high", "urgent"],
          status: ["todo", "in_progress"],
        } as TaskFilters,
        icon: "AlertCircle",
        color: "red",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default_due_soon",
        name: "Sắp hết hạn",
        type: "task",
        filters: {
          status: ["todo", "in_progress"],
          dateRange: {
            start: new Date(),
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
        } as TaskFilters,
        icon: "Clock",
        color: "orange",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default_active_projects",
        name: "Dự án đang hoạt động",
        type: "project",
        filters: {
          status: ["active"],
        } as ProjectFilters,
        icon: "FolderKanban",
        color: "green",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "default_behind_schedule",
        name: "Chậm tiến độ",
        type: "project",
        filters: {
          status: ["active"],
          progressRange: {
            min: 0,
            max: 50,
          },
        } as ProjectFilters,
        icon: "TrendingDown",
        color: "red",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }

  /**
   * Export filters as JSON
   */
  static exportPreset(preset: FilterPreset): string {
    return JSON.stringify(preset, null, 2)
  }

  /**
   * Import filters from JSON
   */
  static importPreset(json: string): FilterPreset {
    try {
      const preset = JSON.parse(json) as FilterPreset
      return this.savePreset({
        name: preset.name,
        type: preset.type,
        filters: preset.filters,
        icon: preset.icon,
        color: preset.color,
      })
    } catch (error) {
      console.error("Failed to import filter preset:", error)
      throw new Error("Invalid preset format")
    }
  }
}
