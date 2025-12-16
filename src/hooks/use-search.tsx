"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { SearchEngine, type SearchResult, type SearchFilters, type SearchOptions } from "@/lib/search"

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

  const search = useCallback(async (options: SearchOptions) => {
    setIsSearching(true)
    setQuery(options.query)
    if (options.filters) {
      setFilters(options.filters)
    }

    try {
      // Use real API search instead of mock data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(options.query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token : ''}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Convert API response to SearchResult format
        let searchResults: SearchResult[] = []
        
        if (data.tasks) {
          searchResults.push(...data.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            type: 'task' as const,
            description: task.description,
            url: `/tasks/${task.id}`,
            metadata: task
          })))
        }
        
        if (data.projects) {
          searchResults.push(...data.projects.map((project: any) => ({
            id: project.id,
            title: project.name,
            type: 'project' as const,
            description: project.description,
            url: `/projects/${project.id}`,
            metadata: project
          })))
        }
        
        if (data.users) {
          searchResults.push(...data.users.map((user: any) => ({
            id: user.id,
            title: user.name,
            type: 'user' as const,
            description: user.email,
            url: `/team`,
            metadata: user
          })))
        }

        setResults(searchResults)
        
        // Add to history
        if (options.query.trim()) {
          SearchEngine.addToHistory(options.query, options.filters, searchResults.length)
          setHistory(SearchEngine.getHistory())
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
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
