import { useAuthStore } from "@/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// ==================== Types ====================
export enum SearchType {
  ALL = "all",
  TASKS = "tasks",
  PROJECTS = "projects",
  NOTES = "notes",
  USERS = "users",
  CHATS = "chats",
}

export interface SearchResultTask {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  project: {
    id: string
    name: string
  }
  assignees: Array<{
    id: string
    name: string
    avatarUrl?: string
  }>
}

export interface SearchResultProject {
  id: string
  name: string
  description?: string
  status: string
  color?: string
  owner: {
    id: string
    name: string
  }
}

export interface SearchResultNote {
  id: string
  title: string
  content?: string
  isPinned: boolean
  createdAt: string
  owner: {
    id: string
    name: string
  }
}

export interface SearchResultUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bio?: string
}

export interface SearchResultChat {
  id: string
  name: string
  type: string
  createdAt: string
  members: Array<{
    id: string
    name: string
    avatarUrl?: string
  }>
}

export interface GlobalSearchResponse {
  query: string
  type: SearchType
  results: {
    tasks?: SearchResultTask[]
    projects?: SearchResultProject[]
    notes?: SearchResultNote[]
    users?: SearchResultUser[]
    chats?: SearchResultChat[]
  }
  totalResults: number
}

export interface SearchSuggestion {
  type: "task" | "project" | "note" | "user" | "chat"
  id: string
  text: string
}

export interface SearchSuggestionsResponse {
  query: string
  suggestions: SearchSuggestion[]
}

export interface RecentSearch {
  query: string
  type: string
  timestamp: string
}

export interface RecentSearchesResponse {
  userId: string
  searches: RecentSearch[]
}

// ==================== Service ====================
class SearchService {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    const state = useAuthStore.getState()
    return state.token
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API Error: ${response.status}`)
    }
    return response.json()
  }

  /**
   * Global search across all resources
   */
  async globalSearch(
    query: string,
    type: SearchType = SearchType.ALL,
    limit: number = 20
  ): Promise<GlobalSearchResponse> {
    try {
      const params = new URLSearchParams({
        query,
        type,
        limit: limit.toString(),
      })

      const response = await fetch(`${API_BASE_URL}/search?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      return this.handleResponse<GlobalSearchResponse>(response)
    } catch (error) {
      console.error("[SearchService] globalSearch error:", error)
      throw error
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSearchSuggestions(
    query: string,
    type: SearchType = SearchType.ALL,
    limit: number = 5
  ): Promise<SearchSuggestionsResponse> {
    try {
      const params = new URLSearchParams({
        query,
        type,
        limit: limit.toString(),
      })

      const response = await fetch(`${API_BASE_URL}/search/suggestions?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      return this.handleResponse<SearchSuggestionsResponse>(response)
    } catch (error) {
      console.error("[SearchService] getSearchSuggestions error:", error)
      throw error
    }
  }

  /**
   * Get recent searches for current user
   */
  async getRecentSearches(limit: number = 10): Promise<RecentSearchesResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      })

      const response = await fetch(`${API_BASE_URL}/search/recent?${params}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      return this.handleResponse<RecentSearchesResponse>(response)
    } catch (error) {
      console.error("[SearchService] getRecentSearches error:", error)
      throw error
    }
  }

  /**
   * Save search query to history
   */
  async saveSearchHistory(query: string, type: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/history`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ query, type }),
      })

      await this.handleResponse(response)
    } catch (error) {
      console.error("[SearchService] saveSearchHistory error:", error)
      throw error
    }
  }

  /**
   * Clear search history for current user
   */
  async clearSearchHistory(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/history`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      await this.handleResponse(response)
    } catch (error) {
      console.error("[SearchService] clearSearchHistory error:", error)
      throw error
    }
  }
}

export default new SearchService()
