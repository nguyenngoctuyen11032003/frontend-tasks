/**
 * Notes Management Library
 * Utilities for managing notes, folders, tags, and search
 */

import type { Note } from "@/types"

// ==================== TYPES ====================

export interface NoteFolder {
  id: string
  name: string
  parentId?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface NoteFilter {
  search?: string
  projectId?: string
  tags?: string[]
  isPinned?: boolean
  folderId?: string
  createdBy?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface NoteSortConfig {
  field: NoteSortField
  direction: "asc" | "desc"
}

export type NoteSortField = "title" | "createdAt" | "updatedAt" | "isPinned"

// ==================== NOTE MANAGER ====================

export class NoteManager {
  /**
   * Filter notes based on criteria
   */
  static filterNotes(notes: Note[], filter: NoteFilter): Note[] {
    return notes.filter((note) => {
      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase()
        const matchesTitle = note.title.toLowerCase().includes(search)
        const matchesContent = note.content.toLowerCase().includes(search)
        const matchesTags = note.tags?.some((tag) => tag.toLowerCase().includes(search))
        if (!matchesTitle && !matchesContent && !matchesTags) return false
      }

      // Project filter
      if (filter.projectId !== undefined) {
        if (filter.projectId === "personal") {
          if (note.projectId) return false
        } else if (filter.projectId !== "all") {
          if (note.projectId !== filter.projectId) return false
        }
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!note.tags || !filter.tags.some((tag) => note.tags?.includes(tag))) {
          return false
        }
      }

      // Pinned filter
      if (filter.isPinned !== undefined) {
        if (note.isPinned !== filter.isPinned) return false
      }

      // Created by filter
      if (filter.createdBy) {
        if (note.createdBy.id !== filter.createdBy) return false
      }

      // Date range filter
      if (filter.dateRange) {
        const noteDate = new Date(note.createdAt)
        if (noteDate < filter.dateRange.from || noteDate > filter.dateRange.to) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Sort notes by specified field and direction
   */
  static sortNotes(notes: Note[], config: NoteSortConfig): Note[] {
    const sorted = [...notes]

    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (config.field) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case "isPinned":
          aValue = a.isPinned ? 1 : 0
          bValue = b.isPinned ? 1 : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return config.direction === "asc" ? -1 : 1
      if (aValue > bValue) return config.direction === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }

  /**
   * Group notes by date (created or updated)
   */
  static groupNotesByDate(
    notes: Note[],
    dateField: "createdAt" | "updatedAt" = "updatedAt"
  ): Record<string, Note[]> {
    const groups: Record<string, Note[]> = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    notes.forEach((note) => {
      const noteDate = new Date(note[dateField])
      const noteDateOnly = new Date(
        noteDate.getFullYear(),
        noteDate.getMonth(),
        noteDate.getDate()
      )

      let groupKey: string

      if (noteDateOnly.getTime() === today.getTime()) {
        groupKey = "Hôm nay"
      } else if (noteDateOnly.getTime() === yesterday.getTime()) {
        groupKey = "Hôm qua"
      } else if (noteDate >= thisWeek) {
        groupKey = "Tuần này"
      } else {
        groupKey = noteDate.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
        })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(note)
    })

    return groups
  }

  /**
   * Extract all unique tags from notes
   */
  static extractTags(notes: Note[]): string[] {
    const tagsSet = new Set<string>()
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }

  /**
   * Get notes statistics
   */
  static getNotesStats(notes: Note[]) {
    const total = notes.length
    const pinned = notes.filter((n) => n.isPinned).length
    const shared = notes.filter((n) => n.isShared).length
    const personal = notes.filter((n) => !n.projectId).length
    const projects = notes.filter((n) => n.projectId).length

    // Group by project
    const byProject: Record<string, number> = {}
    notes.forEach((note) => {
      const projectId = note.projectId || "personal"
      byProject[projectId] = (byProject[projectId] || 0) + 1
    })

    // Group by tags
    const byTag: Record<string, number> = {}
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        byTag[tag] = (byTag[tag] || 0) + 1
      })
    })

    return {
      total,
      pinned,
      shared,
      personal,
      projects,
      byProject,
      byTag,
    }
  }

  /**
   * Search notes with advanced scoring
   */
  static searchNotes(
    notes: Note[],
    query: string,
    options?: {
      fuzzy?: boolean
      maxResults?: number
    }
  ): Note[] {
    if (!query.trim()) return notes

    const searchTerm = query.toLowerCase()
    const scored = notes.map((note) => {
      let score = 0

      // Title match (highest priority)
      if (note.title.toLowerCase().includes(searchTerm)) {
        score += 10
        if (note.title.toLowerCase().startsWith(searchTerm)) {
          score += 5 // Bonus for prefix match
        }
      }

      // Content match
      if (note.content.toLowerCase().includes(searchTerm)) {
        score += 5
      }

      // Tags match
      if (note.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))) {
        score += 7
      }

      // Pinned bonus
      if (note.isPinned) {
        score += 2
      }

      // Recent update bonus (within last 7 days)
      const daysSinceUpdate =
        (Date.now() - new Date(note.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate < 7) {
        score += 1
      }

      return { note, score }
    })

    // Filter out notes with score 0 and sort by score
    const filtered = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)

    // Limit results if specified
    const results = options?.maxResults
      ? filtered.slice(0, options.maxResults)
      : filtered

    return results.map((item) => item.note)
  }

  /**
   * Format note content preview
   */
  static getContentPreview(content: string, maxLength: number = 200): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, "")
    // Remove extra whitespace
    const clean = text.replace(/\s+/g, " ").trim()
    // Truncate
    if (clean.length <= maxLength) return clean
    return clean.substring(0, maxLength).trim() + "..."
  }

  /**
   * Parse tags from string (comma or space separated)
   */
  static parseTags(input: string): string[] {
    return input
      .split(/[,\s]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
  }

  /**
   * Get note word count
   */
  static getWordCount(content: string): number {
    const text = content.replace(/<[^>]*>/g, "")
    const words = text.trim().split(/\s+/)
    return words.filter((word) => word.length > 0).length
  }

  /**
   * Get note reading time (in minutes)
   */
  static getReadingTime(content: string): number {
    const wordCount = this.getWordCount(content)
    const wordsPerMinute = 200 // Average reading speed
    return Math.ceil(wordCount / wordsPerMinute)
  }

  /**
   * Duplicate note with new ID and timestamp
   */
  static duplicateNote(note: Note): Partial<Note> {
    return {
      ...note,
      id: undefined, // Will be generated by server
      title: `${note.title} (Copy)`,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

// ==================== FOLDER MANAGER ====================

export class FolderManager {
  /**
   * Build folder tree from flat list
   */
  static buildTree(folders: NoteFolder[]): NoteFolder[] {
    const map = new Map<string, NoteFolder & { children?: NoteFolder[] }>()
    const roots: NoteFolder[] = []

    // Create map
    folders.forEach((folder) => {
      map.set(folder.id, { ...folder, children: [] })
    })

    // Build tree
    folders.forEach((folder) => {
      const node = map.get(folder.id)!
      if (folder.parentId) {
        const parent = map.get(folder.parentId)
        if (parent) {
          parent.children!.push(node)
        } else {
          roots.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  /**
   * Get all folder IDs including children (recursive)
   */
  static getAllChildIds(folderId: string, folders: NoteFolder[]): string[] {
    const ids = [folderId]
    const children = folders.filter((f) => f.parentId === folderId)
    children.forEach((child) => {
      ids.push(...this.getAllChildIds(child.id, folders))
    })
    return ids
  }

  /**
   * Validate folder move (prevent circular reference)
   */
  static canMoveFolder(
    folderId: string,
    targetParentId: string,
    folders: NoteFolder[]
  ): boolean {
    if (folderId === targetParentId) return false
    const childIds = this.getAllChildIds(folderId, folders)
    return !childIds.includes(targetParentId)
  }
}

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  NOTE_VIEW_MODE: "notes:view-mode",
  NOTE_SORT_PREFERENCE: "notes:sort",
  NOTE_FILTER_PREFERENCE: "notes:filter",
  ACTIVE_FOLDER: "notes:active-folder",
} as const
