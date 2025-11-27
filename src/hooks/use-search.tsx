"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { SearchEngine, type SearchResult, type SearchFilters, type SearchOptions } from "@/lib/search"
import { mockTasks, mockProjects, mockUsers } from "@/mocks/data"

interface SearchContextType {
  results: SearchResult[]
  query: string
  filters: SearchFilters
  isSearching: boolean
  search: (options: SearchOptions) => void
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  clearSearch: () => void
  history: ReturnType<typeof SearchEngine.getHistory>
  clearHistory: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isSearching, setIsSearching] = useState(false)
  const [history, setHistory] = useState(SearchEngine.getHistory())

  const search = useCallback((options: SearchOptions) => {
    setIsSearching(true)
    setQuery(options.query)
    if (options.filters) {
      setFilters(options.filters)
    }

    // Simulate async search
    setTimeout(() => {
      let searchResults: SearchResult[] = []

      // Search across different types
      const types = options.filters?.types || ["all"]
      
      if (types.includes("all") || types.includes("task")) {
        searchResults.push(...SearchEngine.searchTasks(mockTasks, options.query))
      }

      if (types.includes("all") || types.includes("project")) {
        searchResults.push(...SearchEngine.searchProjects(mockProjects, options.query))
      }

      if (types.includes("all") || types.includes("user")) {
        searchResults.push(...SearchEngine.searchUsers(mockUsers, options.query))
      }

      // Apply filters
      if (options.filters) {
        searchResults = SearchEngine.applyFilters(searchResults, options.filters)
      }

      // Sort results
      searchResults = SearchEngine.sortResults(
        searchResults,
        options.sortBy || "relevance",
        options.sortOrder || "desc"
      )

      // Apply pagination
      const limit = options.limit || 50
      const offset = options.offset || 0
      searchResults = searchResults.slice(offset, offset + limit)

      setResults(searchResults)
      setIsSearching(false)

      // Add to history
      if (options.query.trim()) {
        SearchEngine.addToHistory(options.query, options.filters, searchResults.length)
        setHistory(SearchEngine.getHistory())
      }
    }, 300)
  }, [])

  const clearSearch = useCallback(() => {
    setResults([])
    setQuery("")
    setFilters({})
  }, [])

  const clearHistory = useCallback(() => {
    SearchEngine.clearHistory()
    setHistory([])
  }, [])

  return (
    <SearchContext.Provider
      value={{
        results,
        query,
        filters,
        isSearching,
        search,
        setQuery,
        setFilters,
        clearSearch,
        history,
        clearHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
