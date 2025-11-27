"use client"

/**
 * Filter Context Provider
 * Manages filter state and operations
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { FilterManager, type TaskFilters, type ProjectFilters, type FilterPreset } from "@/lib/filters"

interface FilterContextValue {
  // Task filters
  taskFilters: TaskFilters
  setTaskFilters: (filters: TaskFilters | ((prev: TaskFilters) => TaskFilters)) => void
  clearTaskFilters: () => void
  hasActiveTaskFilters: boolean

  // Project filters
  projectFilters: ProjectFilters
  setProjectFilters: (filters: ProjectFilters | ((prev: ProjectFilters) => ProjectFilters)) => void
  clearProjectFilters: () => void
  hasActiveProjectFilters: boolean

  // Presets
  presets: FilterPreset[]
  taskPresets: FilterPreset[]
  projectPresets: FilterPreset[]
  savePreset: (preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">) => FilterPreset
  updatePreset: (id: string, updates: Partial<Omit<FilterPreset, "id" | "createdAt">>) => FilterPreset | null
  deletePreset: (id: string) => boolean
  applyPreset: (preset: FilterPreset) => void
  refreshPresets: () => void
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  // Task filters state
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    assignees: [],
    tags: [],
    dateRange: { start: null, end: null },
    projectId: undefined,
    search: "",
  })

  // Project filters state
  const [projectFilters, setProjectFilters] = useState<ProjectFilters>({
    status: [],
    members: [],
    tags: [],
    dateRange: { start: null, end: null },
    progressRange: undefined,
    search: "",
  })

  // Presets state
  const [presets, setPresets] = useState<FilterPreset[]>([])

  // Load presets on mount
  useEffect(() => {
    setPresets(FilterManager.getPresets())
  }, [])

  // Clear task filters
  const clearTaskFilters = useCallback(() => {
    setTaskFilters(FilterManager.clearFilters("task") as TaskFilters)
  }, [])

  // Clear project filters
  const clearProjectFilters = useCallback(() => {
    setProjectFilters(FilterManager.clearFilters("project") as ProjectFilters)
  }, [])

  // Check if task filters are active
  const hasActiveTaskFilters = FilterManager.hasActiveFilters(taskFilters)

  // Check if project filters are active
  const hasActiveProjectFilters = FilterManager.hasActiveFilters(projectFilters)

  // Get task presets
  const taskPresets = presets.filter((p) => p.type === "task")

  // Get project presets
  const projectPresets = presets.filter((p) => p.type === "project")

  // Save preset
  const savePreset = useCallback(
    (preset: Omit<FilterPreset, "id" | "createdAt" | "updatedAt">) => {
      const newPreset = FilterManager.savePreset(preset)
      setPresets(FilterManager.getPresets())
      return newPreset
    },
    []
  )

  // Update preset
  const updatePreset = useCallback(
    (id: string, updates: Partial<Omit<FilterPreset, "id" | "createdAt">>) => {
      const updated = FilterManager.updatePreset(id, updates)
      if (updated) {
        setPresets(FilterManager.getPresets())
      }
      return updated
    },
    []
  )

  // Delete preset
  const deletePreset = useCallback((id: string) => {
    const success = FilterManager.deletePreset(id)
    if (success) {
      setPresets(FilterManager.getPresets())
    }
    return success
  }, [])

  // Apply preset
  const applyPreset = useCallback((preset: FilterPreset) => {
    if (preset.type === "task") {
      setTaskFilters(preset.filters as TaskFilters)
    } else {
      setProjectFilters(preset.filters as ProjectFilters)
    }
  }, [])

  // Refresh presets from localStorage
  const refreshPresets = useCallback(() => {
    setPresets(FilterManager.getPresets())
  }, [])

  return (
    <FilterContext.Provider
      value={{
        taskFilters,
        setTaskFilters,
        clearTaskFilters,
        hasActiveTaskFilters,
        projectFilters,
        setProjectFilters,
        clearProjectFilters,
        hasActiveProjectFilters,
        presets,
        taskPresets,
        projectPresets,
        savePreset,
        updatePreset,
        deletePreset,
        applyPreset,
        refreshPresets,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}
