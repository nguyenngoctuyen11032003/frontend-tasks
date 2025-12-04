import { create } from "zustand"
import { devtools } from "zustand/middleware"
import SearchService, {
  SearchType,
  type GlobalSearchResponse,
  type SearchSuggestionsResponse,
  type RecentSearchesResponse,
  type SearchSuggestion,
  type RecentSearch,
} from "@/services/search.service"

interface SearchState {
  // Search results
  searchResults: GlobalSearchResponse | null
  suggestions: SearchSuggestion[]
  recentSearches: RecentSearch[]

  // UI state
  loading: boolean
  suggestionsLoading: boolean
  error: string | null
  currentQuery: string
  currentType: SearchType

  // Actions
  search: (query: string, type?: SearchType, limit?: number) => Promise<void>
  getSuggestions: (query: string, type?: SearchType, limit?: number) => Promise<void>
  getRecentSearches: (limit?: number) => Promise<void>
  saveToHistory: (query: string, type: string) => Promise<void>
  clearHistory: () => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
}

const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      searchResults: null,
      suggestions: [],
      recentSearches: [],
      loading: false,
      suggestionsLoading: false,
      error: null,
      currentQuery: "",
      currentType: SearchType.ALL,

      // Search action
      search: async (query: string, type = SearchType.ALL, limit = 20) => {
        try {
          if (!query.trim()) {
            set({ searchResults: null, error: null })
            return
          }

          set({ loading: true, error: null, currentQuery: query, currentType: type })

          const results = await SearchService.globalSearch(query, type, limit)
          set({ searchResults: results, loading: false })

          // Save to history
          try {
            await SearchService.saveSearchHistory(query, type)
          } catch (historyError) {
            console.warn("[SearchStore] Failed to save search history:", historyError)
            // Don't fail the entire search if history save fails
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to search"
          set({ error: errorMessage, loading: false, searchResults: null })
          console.error("[SearchStore] search error:", error)
        }
      },

      // Get suggestions (autocomplete)
      getSuggestions: async (query: string, type = SearchType.ALL, limit = 5) => {
        try {
          if (!query.trim()) {
            set({ suggestions: [] })
            return
          }

          set({ suggestionsLoading: true, error: null })

          const response = await SearchService.getSearchSuggestions(query, type, limit)
          set({ suggestions: response.suggestions, suggestionsLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to get suggestions"
          set({ error: errorMessage, suggestionsLoading: false, suggestions: [] })
          console.error("[SearchStore] getSuggestions error:", error)
        }
      },

      // Get recent searches
      getRecentSearches: async (limit = 10) => {
        try {
          set({ loading: true, error: null })
          const response = await SearchService.getRecentSearches(limit)
          set({ recentSearches: response.searches, loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to get recent searches"
          set({ error: errorMessage, loading: false, recentSearches: [] })
          console.error("[SearchStore] getRecentSearches error:", error)
        }
      },

      // Save search to history
      saveToHistory: async (query: string, type: string) => {
        try {
          await SearchService.saveSearchHistory(query, type)
          // Refresh recent searches
          await get().getRecentSearches()
        } catch (error) {
          console.error("[SearchStore] saveToHistory error:", error)
          // Don't throw - history save is non-critical
        }
      },

      // Clear search history
      clearHistory: async () => {
        try {
          set({ loading: true, error: null })
          await SearchService.clearSearchHistory()
          set({ recentSearches: [], loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to clear history"
          set({ error: errorMessage, loading: false })
          console.error("[SearchStore] clearHistory error:", error)
        }
      },

      // Clear search results
      clearResults: () => {
        set({
          searchResults: null,
          suggestions: [],
          currentQuery: "",
          currentType: SearchType.ALL,
          error: null,
        })
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error })
      },
    }),
    { name: "SearchStore" }
  )
)

export default useSearchStore
