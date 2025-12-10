import { useEffect, useCallback, useRef } from "react"
import { useAdminStore } from "@/stores/admin-store"
import { DateRange } from "@/types"

export const useDashboard = (initialDateRange: DateRange = "month") => {
  const store = useAdminStore()
  const hasFetchedRef = useRef(false)

  // Fetch all dashboard data
  const fetchAllData = useCallback(
    async (dateRange: DateRange = initialDateRange) => {
      try {
        store.setIsLoading(true)
        store.clearError()

        // Fetch all data in parallel
        await Promise.all([
          store.fetchDashboardStats(dateRange),
          store.fetchRecentActivity(20),
        ])

        store.setIsLoading(false)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load dashboard data"
        store.setError(errorMessage)
        store.setIsLoading(false)
      }
    },
    [initialDateRange, store]
  )

  // Initial fetch on mount only
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchAllData(store.selectedDateRange || initialDateRange)
      hasFetchedRef.current = true
    }
  }, [])

  const updateDateRange = useCallback(
    (newRange: DateRange) => {
      store.setDateRange(newRange)
      fetchAllData(newRange)
    },
    [store, fetchAllData]
  )

  const refetch = useCallback(() => {
    fetchAllData(store.selectedDateRange || initialDateRange)
  }, [fetchAllData, store.selectedDateRange, initialDateRange])

  return {
    // Data
    stats: store.dashboardStats,
    activities: store.recentActivity,
    topUsers: store.topUsers,
    userActivityStats: store.userActivityStats,

    // UI State
    isLoading: store.statsLoading,
    error: store.statsError,
    selectedDateRange: store.selectedDateRange || initialDateRange,

    // Actions
    updateDateRange,
    refetch,
  }
}

