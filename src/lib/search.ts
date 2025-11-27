/**
 * Search System
 * Provides utilities for searching across the application
 */

import type { Task, Project, User, Note } from "@/types"

export type SearchableType = "task" | "project" | "note" | "user" | "team" | "all"

export interface SearchResult {
  id: string
  type: SearchableType
  title: string
  description?: string
  subtitle?: string
  metadata?: Record<string, any>
  score: number // Relevance score 0-100
  highlights?: {
    field: string
    text: string
    indices: [number, number][]
  }[]
}

export interface SearchFilters {
  types?: SearchableType[]
  status?: string[]
  priority?: string[]
  assignee?: string[]
  tags?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export interface SearchOptions {
  query: string
  filters?: SearchFilters
  limit?: number
  offset?: number
  sortBy?: "relevance" | "date" | "title" | "priority"
  sortOrder?: "asc" | "desc"
}

export interface SearchHistory {
  id: string
  query: string
  filters?: SearchFilters
  timestamp: Date
  resultCount: number
}

// Search algorithm utilities
export class SearchEngine {
  private static STORAGE_KEY = "search-history"
  private static MAX_HISTORY = 20

  /**
   * Calculate similarity score between query and text
   */
  static calculateScore(query: string, text: string): number {
    const normalizedQuery = query.toLowerCase().trim()
    const normalizedText = text.toLowerCase()

    if (!normalizedQuery || !normalizedText) return 0

    // Exact match
    if (normalizedText === normalizedQuery) return 100

    // Starts with query
    if (normalizedText.startsWith(normalizedQuery)) return 90

    // Contains whole query
    if (normalizedText.includes(normalizedQuery)) return 70

    // Word match
    const queryWords = normalizedQuery.split(/\s+/)
    const textWords = normalizedText.split(/\s+/)
    const matchedWords = queryWords.filter((qw) =>
      textWords.some((tw) => tw.includes(qw) || qw.includes(tw))
    )
    const wordMatchRatio = matchedWords.length / queryWords.length
    if (wordMatchRatio > 0) return Math.floor(50 * wordMatchRatio)

    // Fuzzy match (Levenshtein distance)
    const distance = this.levenshteinDistance(normalizedQuery, normalizedText)
    const maxLength = Math.max(normalizedQuery.length, normalizedText.length)
    const similarity = 1 - distance / maxLength
    return Math.floor(30 * similarity)
  }

  /**
   * Levenshtein distance for fuzzy matching
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Find highlight indices for matched text
   */
  static findHighlights(query: string, text: string): [number, number][] {
    const normalizedQuery = query.toLowerCase().trim()
    const normalizedText = text.toLowerCase()
    const highlights: [number, number][] = []

    let startIndex = 0
    while (startIndex < normalizedText.length) {
      const index = normalizedText.indexOf(normalizedQuery, startIndex)
      if (index === -1) break
      highlights.push([index, index + normalizedQuery.length])
      startIndex = index + normalizedQuery.length
    }

    return highlights
  }

  /**
   * Search tasks
   */
  static searchTasks(tasks: Task[], query: string): SearchResult[] {
    const results = tasks
      .map((task) => {
        const titleScore = this.calculateScore(query, task.title)
        const descScore = task.description ? this.calculateScore(query, task.description) : 0
        const score = Math.max(titleScore, descScore * 0.7)

        if (score < 10) return null

        return {
          id: task.id,
          type: "task" as SearchableType,
          title: task.title,
          description: task.description,
          subtitle: `${task.status} • ${task.priority}`,
          metadata: {
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            assignees: task.assignees,
          },
          score,
          highlights: [
            {
              field: "title",
              text: task.title,
              indices: this.findHighlights(query, task.title),
            },
          ],
        }
      })
      .filter(Boolean) as SearchResult[]
    
    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Search projects
   */
  static searchProjects(projects: Project[], query: string): SearchResult[] {
    const results = projects
      .map((project) => {
        const titleScore = this.calculateScore(query, project.name)
        const descScore = project.description ? this.calculateScore(query, project.description) : 0
        const score = Math.max(titleScore, descScore * 0.7)

        if (score < 10) return null

        return {
          id: project.id,
          type: "project" as SearchableType,
          title: project.name,
          description: project.description,
          subtitle: `${project.status} • ${project.progress}%`,
          metadata: {
            status: project.status,
            progress: project.progress,
            members: project.members,
          },
          score,
          highlights: [
            {
              field: "title",
              text: project.name,
              indices: this.findHighlights(query, project.name),
            },
          ],
        }
      })
      .filter(Boolean) as SearchResult[]
    
    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Search users
   */
  static searchUsers(users: User[], query: string): SearchResult[] {
    const results = users
      .map((user) => {
        const nameScore = this.calculateScore(query, user.name)
        const emailScore = this.calculateScore(query, user.email)
        const score = Math.max(nameScore, emailScore * 0.8)

        if (score < 10) return null

        return {
          id: user.id,
          type: "user" as SearchableType,
          title: user.name,
          subtitle: user.email,
          description: user.role,
          metadata: {
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
          score,
          highlights: [
            {
              field: "name",
              text: user.name,
              indices: this.findHighlights(query, user.name),
            },
          ],
        }
      })
      .filter(Boolean) as SearchResult[]
    
    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Apply filters to search results
   */
  static applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results

    if (filters.types && filters.types.length > 0 && !filters.types.includes("all")) {
      filtered = filtered.filter((r) => filters.types!.includes(r.type))
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((r) => filters.status!.includes(r.metadata?.status))
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((r) => filters.priority!.includes(r.metadata?.priority))
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filtered = filtered.filter((r) => filters.assignee!.includes(r.metadata?.assignee?.id))
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange
      filtered = filtered.filter((r) => {
        const date = r.metadata?.dueDate ? new Date(r.metadata.dueDate) : null
        if (!date) return false
        if (from && date < from) return false
        if (to && date > to) return false
        return true
      })
    }

    return filtered
  }

  /**
   * Sort search results
   */
  static sortResults(
    results: SearchResult[],
    sortBy: "relevance" | "date" | "title" | "priority",
    sortOrder: "asc" | "desc" = "desc"
  ): SearchResult[] {
    const sorted = [...results]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "relevance":
          comparison = b.score - a.score
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "date":
          const dateA = a.metadata?.dueDate ? new Date(a.metadata.dueDate).getTime() : 0
          const dateB = b.metadata?.dueDate ? new Date(b.metadata.dueDate).getTime() : 0
          comparison = dateB - dateA
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const priorityA = priorityOrder[a.metadata?.priority as keyof typeof priorityOrder] || 0
          const priorityB = priorityOrder[b.metadata?.priority as keyof typeof priorityOrder] || 0
          comparison = priorityB - priorityA
          break
      }

      return sortOrder === "asc" ? -comparison : comparison
    })

    return sorted
  }

  /**
   * Get search history
   */
  static getHistory(): SearchHistory[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const history = JSON.parse(stored)
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
    } catch {
      return []
    }
  }

  /**
   * Add to search history
   */
  static addToHistory(query: string, filters?: SearchFilters, resultCount: number = 0): void {
    if (!query.trim()) return

    const history = this.getHistory()
    const newEntry: SearchHistory = {
      id: `search-${Date.now()}`,
      query,
      filters,
      timestamp: new Date(),
      resultCount,
    }

    // Remove duplicate queries
    const filtered = history.filter((h) => h.query !== query)
    filtered.unshift(newEntry)

    // Keep only MAX_HISTORY items
    const trimmed = filtered.slice(0, this.MAX_HISTORY)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed))
  }

  /**
   * Clear search history
   */
  static clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Get search suggestions based on history and popular searches
   */
  static getSuggestions(query: string): string[] {
    const history = this.getHistory()
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      // Return recent searches if no query
      return history.slice(0, 5).map((h) => h.query)
    }

    // Filter history by query prefix
    const matching = history
      .filter((h) => h.query.toLowerCase().startsWith(normalizedQuery))
      .map((h) => h.query)

    // Add common suggestions
    const commonSuggestions = [
      "high priority tasks",
      "overdue tasks",
      "my tasks",
      "completed projects",
      "in progress",
    ].filter((s) => s.toLowerCase().includes(normalizedQuery))

    // Combine and deduplicate
    const suggestions = [...new Set([...matching, ...commonSuggestions])]

    return suggestions.slice(0, 5)
  }
}
