import { useEffect, useCallback } from "react"
import { useAdminStore } from "@/stores/admin-store"
import { DateRange } from "@/types"

export const useDashboard = (initialDateRange: DateRange = "month") => {
  const store = useAdminStore()

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
    [store, initialDateRange]
  )

  // Initial fetch on mount
  useEffect(() => {
    fetchAllData(store.selectedDateRange || initialDateRange)
  }, [])

  // Refetch when date range changes
  useEffect(() => {
    if (store.selectedDateRange !== initialDateRange) {
      fetchAllData(store.selectedDateRange)
    }
  }, [store.selectedDateRange, initialDateRange, fetchAllData])

  const updateDateRange = useCallback(
    (newRange: DateRange) => {
      store.setDateRange(newRange)
    },
    [store]
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
