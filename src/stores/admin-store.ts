import { create } from "zustand"
import api from "@/lib/api"
import type {
  SystemSetting,
  ActivityLog,
  ActivityLogQuery,
  DashboardStats,
  UserActivityStat,
  TopUser,
  SystemHealth,
  DatabaseCleanupResult,
  PaginatedResponse,
  DateRange,
} from "@/types"
import { toast } from "sonner"

interface AdminState {
  // System Settings
  systemSettings: SystemSetting[]
  settingsLoading: boolean
  settingsError: string | null

  // Activity Logs
  activityLogs: PaginatedResponse<ActivityLog> | null
  logsLoading: boolean
  logsError: string | null

  // Dashboard Stats
  dashboardStats: DashboardStats | null
  userActivityStats: UserActivityStat[]
  recentActivity: ActivityLog[]
  topUsers: TopUser[]
  statsLoading: boolean
  statsError: string | null
  selectedDateRange: DateRange

  // System Health
  systemHealth: SystemHealth | null
  healthLoading: boolean
  healthError: string | null

  // Actions - System Settings
  fetchSystemSettings: () => Promise<void>
  updateSystemSetting: (key: string, data: { value: string; description?: string; isPublic?: boolean }) => Promise<void>

  // Actions - Activity Logs
  fetchActivityLogs: (query?: ActivityLogQuery) => Promise<void>
  clearActivityLogs: (days?: number) => Promise<void>

  // Actions - Dashboard Stats
  fetchDashboardStats: (dateRange?: DateRange) => Promise<void>
  fetchUserActivityStats: (days?: number) => Promise<void>
  fetchRecentActivity: (limit?: number) => Promise<void>
  fetchTopUsers: (limit?: number) => Promise<void>

  // Actions - System Health
  fetchSystemHealth: () => Promise<void>

  // Actions - Database Maintenance
  performDatabaseCleanup: () => Promise<DatabaseCleanupResult | null>

  // Actions - Utility
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  setDateRange: (range: DateRange) => void

  // Actions - Reset
  resetState: () => void
}

const initialState = {
  systemSettings: [],
  settingsLoading: false,
  settingsError: null,
  activityLogs: null,
  logsLoading: false,
  logsError: null,
  dashboardStats: null,
  userActivityStats: [],
  recentActivity: [],
  topUsers: [],
  statsLoading: false,
  statsError: null,
  selectedDateRange: "month" as DateRange,
  systemHealth: null,
  healthLoading: false,
  healthError: null,
}

export const useAdminStore = create<AdminState>((set, get) => ({
  ...initialState,

  // System Settings
  fetchSystemSettings: async () => {
    set({ settingsLoading: true, settingsError: null })
    try {
      console.log('⚙️ Fetching system settings...')
      const settings = await api.getSystemSettings()
      console.log('✅ System settings fetched:', settings)
      set({ systemSettings: settings, settingsLoading: false })
    } catch (error: any) {
      console.error('❌ Failed to fetch system settings:', error)
      set({ settingsError: error.message, settingsLoading: false })
      toast.error("Không thể tải cài đặt hệ thống", {
        description: error.message,
      })
    }
  },

  updateSystemSetting: async (key: string, data: { value: string; description?: string; isPublic?: boolean }) => {
    set({ settingsLoading: true, settingsError: null })
    try {
      const updatedSetting = await api.updateSystemSetting(key, data)
      
      // Update in local state
      set((state) => ({
        systemSettings: state.systemSettings.map((s) => 
          s.key === key ? updatedSetting : s
        ),
        settingsLoading: false,
      }))

      toast.success("Cập nhật cài đặt thành công")
    } catch (error: any) {
      set({ settingsError: error.message, settingsLoading: false })
      toast.error("Không thể cập nhật cài đặt", {
        description: error.message,
      })
      throw error
    }
  },

  // Activity Logs
  fetchActivityLogs: async (query?: ActivityLogQuery) => {
    set({ logsLoading: true, logsError: null })
    try {
      console.log('📋 Fetching activity logs with query:', query)
      const logs = await api.getActivityLogs(query)
      console.log('✅ Activity logs fetched:', logs)
      set({ activityLogs: logs, logsLoading: false })
    } catch (error: any) {
      console.error('❌ Failed to fetch activity logs:', error)
      set({ logsError: error.message, logsLoading: false })
      toast.error("Không thể tải nhật ký hoạt động", {
        description: error.message,
      })
    }
  },

  clearActivityLogs: async (days: number = 90) => {
    set({ logsLoading: true, logsError: null })
    try {
      const result = await api.clearActivityLogs(days)
      toast.success(`Đã xóa ${result.deleted} bản ghi nhật ký cũ`)
      
      // Refresh logs
      await get().fetchActivityLogs()
    } catch (error: any) {
      set({ logsError: error.message, logsLoading: false })
      toast.error("Không thể xóa nhật ký", {
        description: error.message,
      })
      throw error
    }
  },

  // Dashboard Stats
  fetchDashboardStats: async (dateRange?: DateRange) => {
    set({ statsLoading: true, statsError: null })
    try {
      console.log('≡ƒôè Fetching dashboard stats...')
      const stats = await api.getDashboardStats()
      console.log('Γ£à Dashboard stats fetched:', stats)
      set({ dashboardStats: stats, statsLoading: false })
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard stats:', error)
      set({ statsError: error.message, statsLoading: false })
      toast.error("Không thể tải thống kê", {
        description: error.message,
      })
    }
  },

  fetchUserActivityStats: async (days: number = 30) => {
    set({ statsLoading: true, statsError: null })
    try {
      const stats = await api.getUserActivityStats(days)
      set({ userActivityStats: stats, statsLoading: false })
    } catch (error: any) {
      set({ statsError: error.message, statsLoading: false })
      toast.error("Không thể tải thống kê hoạt động", {
        description: error.message,
      })
    }
  },

  fetchRecentActivity: async (limit: number = 20) => {
    try {
      const activity = await api.getRecentActivity(limit)
      set({ recentActivity: activity })
    } catch (error: any) {
      toast.error("Không thể tải hoạt động gần đây", {
        description: error.message,
      })
    }
  },

  fetchTopUsers: async (limit: number = 10) => {
    try {
      const users = await api.getTopUsers(limit)
      set({ topUsers: users })
    } catch (error: any) {
      toast.error("Không thể tải người dùng hoạt động nhất", {
        description: error.message,
      })
    }
  },

  // System Health
  fetchSystemHealth: async () => {
    set({ healthLoading: true, healthError: null })
    try {
      console.log('❤️ Fetching system health...')
      const health = await api.getSystemHealth()
      console.log('✅ System health fetched:', health)
      set({ systemHealth: health, healthLoading: false })
    } catch (error: any) {
      console.error('❌ Health check failed:', error)
      set({ healthError: error.message, healthLoading: false })
      // Don't show toast for health check failures to avoid spam
      console.error("Health check failed:", error.message)
    }
  },

  // Database Maintenance
  performDatabaseCleanup: async () => {
    try {
      const result = await api.performDatabaseCleanup()
      toast.success("Dọn dẹp cơ sở dữ liệu thành công", {
        description: `Đã xóa: ${result.deletedActivityLogs} logs, ${result.deletedSessions} sessions, ${result.deletedNotifications} notifications`,
      })
      
      // Refresh stats after cleanup
      await get().fetchDashboardStats()
      
      return result
    } catch (error: any) {
      toast.error("Không thể dọn dẹp cơ sở dữ liệu", {
        description: error.message,
      })
      return null
    }
  },

  // Utility Methods
  setIsLoading: (loading: boolean) => {
    set({ statsLoading: loading })
  },

  setError: (error: string | null) => {
    set({ statsError: error })
  },

  clearError: () => {
    set({ statsError: null })
  },

  setDateRange: (range: DateRange) => {
    set({ selectedDateRange: range })
  },

  // Reset
  resetState: () => {
    set(initialState)
  },
}))
