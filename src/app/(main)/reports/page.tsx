"use client"
import React, { useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  BarChart3,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { useReportsStore } from "@/stores/reports-store"
import { reportsService, ChartType, ReportType, ExportFormat } from "@/services/reports.service"
import { AdvancedExportReportDialog } from "@/components/reports"

/**
 * Helper function to get chart color for status
 */
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    "todo": "#64748b",
    "in_progress": "#3b82f6",
    "review": "#f59e0b",
    "done": "#10b981",
    "urgent": "#ef4444",
    "high": "#f97316",
    "medium": "#eab308",
    "low": "#22c55e",
    "active": "#3b82f6",
    "on-hold": "#f59e0b",
    "completed": "#10b981",
    "_id": "#8b5cf6",
  }
  return colors[status] || "#94a3b8"
}

/**
 * Helper function to translate status/priority to Vietnamese
 */
const getVietnameseLabel = (label: string): string => {
  const translations: Record<string, string> = {
    // Task status
    "todo": "Chưa bắt đầu",
    "in_progress": "Đang tiến hành",
    "in progress": "Đang tiến hành",
    "review": "Chờ xem xét",
    "done": "Hoàn thành",
    "completed": "Hoàn thành",
    
    // Priority
    "urgent": "Cấp bách",
    "high": "Cao",
    "medium": "Trung bình",
    "low": "Thấp",
    
    // Project status
    "active": "Hoạt động",
    "on-hold": "Tạm dừng",
    "on_hold": "Tạm dừng",
    "paused": "Tạm dừng",
    
    // Common
    "none": "Không",
    "unknown": "Không xác định",
  }
  
  const key = label.toLowerCase().trim()
  return translations[key] || label
}

/**
 * Skeleton loader component
 */
const ChartSkeleton = () => (
  <div className="h-[280px] bg-muted animate-pulse rounded-lg" />
)

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
      </div>
    </CardContent>
  </Card>
)

export default function ReportsPage() {
  // Zustand store hooks
  const {
    statistics,
    chartData,
    teamPerformance,
    projectsStatistics,
    filters,
    loading,
    error,
    fetchStatistics,
    fetchAllChartData,
    fetchTeamPerformance,
    fetchProjectsStatistics,
    setFilters,
    clearError,
  } = useReportsStore()

  // Local state for date range
  const [dateRange, setDateRange] = React.useState("year")
  const [showAdvancedExportDialog, setShowAdvancedExportDialog] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  /**
   * Calculate date range based on selected period
   */
  const getDateRange = (range: string) => {
    const today = new Date()
    const startDate = new Date()

    switch (range) {
      case "week":
        startDate.setDate(today.getDate() - today.getDay())
        break
      case "month":
        startDate.setDate(1)
        break
      case "quarter":
        startDate.setMonth(Math.floor(today.getMonth() / 3) * 3)
        startDate.setDate(1)
        break
      case "year":
      default:
        startDate.setMonth(0)
        startDate.setDate(1)
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    }
  }

  /**
   * Load data when component mounts or filters change
   */
  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange)

    setFilters({
      startDate,
      endDate,
    })

    // Fetch statistics and all charts
    Promise.all([
      fetchStatistics(),
      fetchAllChartData(),
      fetchTeamPerformance(),
      fetchProjectsStatistics(),
    ]).catch((err) => {
      console.error("Failed to fetch reports:", err)
    })
  }, [dateRange, fetchStatistics, fetchAllChartData, fetchTeamPerformance, fetchProjectsStatistics, setFilters])

  /**
   * Transform chart data for display
   */
  const tasksByStatusData = useMemo(() => {
    const chart = chartData.find((c) => c.type === ChartType.TASK_STATUS)
    if (!chart) return []

    return chart.data.map((item) => ({
      name: getVietnameseLabel(item.label || item._id || "Không xác định"),
      value: item.value || item.count || 0,
      color: getStatusColor(item._id || item.label || "unknown"),
    }))
  }, [chartData])

  const priorityData = useMemo(() => {
    const chart = chartData.find((c) => c.type === ChartType.TASK_PRIORITY)
    if (!chart) return []

    return chart.data.map((item) => ({
      name: getVietnameseLabel(item.label || item._id || "Không xác định"),
      value: item.value || item.count || 0,
      color: getStatusColor(item._id || item.label || "unknown"),
    }))
  }, [chartData])

  const projectStatusData = useMemo(() => {
    const chart = chartData.find((c) => c.type === ChartType.PROJECT_STATUS)
    if (!chart) return []

    return chart.data.map((item) => ({
      name: getVietnameseLabel(item.label || item._id || "Không xác định"),
      value: item.value || item.count || 0,
      color: getStatusColor(item._id || item.label || "unknown"),
    }))
  }, [chartData])

  const userActivityData = useMemo(() => {
    const chart = chartData.find((c) => c.type === ChartType.USER_ACTIVITY)
    if (!chart) return []

    return chart.data.map((item) => ({
      name: item.label || item.name || "User",
      tasks: item.value || item.count || 0,
      color: getStatusColor("_id"),
    }))
  }, [chartData])

  const completionTrendData = useMemo(() => {
    const chart = chartData.find((c) => c.type === ChartType.TASK_COMPLETION_TREND)
    if (!chart) return []

    return chart.data.map((item) => ({
      name: new Date(item.date || new Date()).toLocaleDateString("vi-VN", {
        month: "2-digit",
        day: "2-digit",
      }),
      rate: item.value || item.percentage || 0,
    }))
  }, [chartData])

  /**
   * Handle export from dialog
   */
  const handleExportReport = async (format: ExportFormat, filename: string) => {
    try {
      const { startDate, endDate } = getDateRange(dateRange)

      const report = await reportsService.downloadReport({
        type: ReportType.TASKS,
        startDate,
        endDate,
        format,
      })

      // Create download link
      const url = window.URL.createObjectURL(report)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Báo cáo đã được xuất thành công`)
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Không thể xuất báo cáo")
    }
  }

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
  }

  // Render loading state
  if (loading && !statistics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Báo cáo</h1>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <ChartSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Báo cáo</h1>
            <p className="text-muted-foreground">Phân tích và thống kê hiệu suất làm việc</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Reports</h3>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearError}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Báo cáo</h1>
          <p className="text-muted-foreground">Phân tích và thống kê hiệu suất làm việc</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowAdvancedExportDialog(true)}
            disabled={loading || isExporting}
            size="sm"
          >
            {loading || isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </>
            )}
          </Button>

          <AdvancedExportReportDialog
            isOpen={showAdvancedExportDialog}
            onOpenChange={setShowAdvancedExportDialog}
            onExport={handleExportReport}
            isLoading={isExporting}
            suggestedFilename={`bao-cao-${dateRange}`}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Tổng công việc",
            value: statistics?.totalTasks || 0,
            change: "+12%",
            trend: "up",
            icon: BarChart3,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Hoàn thành",
            value: statistics?.completedTasks || 0,
            change: "+8%",
            trend: "up",
            icon: CheckCircle2,
            color: "text-green-600 bg-green-100 dark:bg-green-900/30",
          },
          {
            title: "Tỷ lệ hoàn thành",
            value: `${statistics?.completionRate || 0}%`,
            change: "+5%",
            trend: "up",
            icon: TrendingUp,
            color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
          },
          {
            title: "Dự án hoạt động",
            value: statistics?.projectsInProgress || 0,
            change: "-2",
            trend: "down",
            icon: Users,
            color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {stat.trend === "up" ? (
                          <ArrowUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="team">Đội ngũ</TabsTrigger>
          <TabsTrigger value="projects">Dự án</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* First Row - 3 Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Task Distribution by Status */}
            {tasksByStatusData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân bổ theo trạng thái</CardTitle>
                  <CardDescription>Tổng {statistics?.totalTasks || 0} công việc</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={tasksByStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {tasksByStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {tasksByStatusData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân bổ theo trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
            )}

            {/* Priority Distribution */}
            {priorityData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân bổ theo độ ưu tiên</CardTitle>
                  <CardDescription>Mức độ ưu tiên công việc</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`priority-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {priorityData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân bổ theo độ ưu tiên</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
            )}

            {/* Project Status */}
            {projectStatusData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái dự án</CardTitle>
                  <CardDescription>Dự án theo trạng thái</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`project-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {projectStatusData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái dự án</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Second Row - 2 Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Completion Rate Trend */}
            {completionTrendData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Xu hướng hoàn thành</CardTitle>
                  <CardDescription>Tỷ lệ hoàn thành theo ngày</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={completionTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#3b82f6"
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Xu hướng hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
            )}

            {/* User Activity */}
            {userActivityData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hoạt động người dùng</CardTitle>
                  <CardDescription>Công việc hoàn thành theo thành viên</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hoạt động người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất đội ngũ</CardTitle>
              <CardDescription>Thống kê công việc theo thành viên</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : teamPerformance.length > 0 ? (
                <div className="space-y-4">
                  {teamPerformance.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground ml-13">
                          <span>Giao: {member.assignedTasks}</span>
                          <span>Hoàn thành: {member.completedTasks}</span>
                          <span>Đang xử lý: {member.pendingTasks}</span>
                        </div>
                      </div>
                      <div className="text-right min-w-24">
                        <div className="w-16 h-2 bg-muted rounded-full mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                            style={{ width: `${Math.min(member.completionRate, 100)}%` }}
                          />
                        </div>
                        <p className="font-semibold text-sm">{member.completionRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có dữ liệu hiệu suất đội ngũ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dự án</CardTitle>
              <CardDescription>Thống kê dự án</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : projectsStatistics.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {projectsStatistics.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-l-4" style={{
                        borderLeftColor: project.status === 'ACTIVE' ? '#3b82f6' : project.status === 'ON_HOLD' ? '#f59e0b' : '#10b981'
                      }}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-sm">{project.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Trạng thái: <span className="font-medium">{
                                  project.status === 'ACTIVE' ? 'Hoạt động' :
                                  project.status === 'ON_HOLD' ? 'Tạm dừng' :
                                  'Hoàn thành'
                                }</span>
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-muted p-2 rounded">
                                <p className="text-lg font-bold">{project.totalTasks}</p>
                                <p className="text-xs text-muted-foreground">Tổng cộng</p>
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{project.completedTasks}</p>
                                <p className="text-xs text-green-700 dark:text-green-300">Hoàn thành</p>
                              </div>
                              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{project.inProgressTasks}</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Đang xử lý</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Tiến độ hoàn thành</p>
                                <p className="text-sm font-semibold">{project.completionRate}%</p>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                                  style={{ width: `${Math.min(project.completionRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không có dữ liệu dự án</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
