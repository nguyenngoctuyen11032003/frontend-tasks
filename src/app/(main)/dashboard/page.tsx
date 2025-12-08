"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, FolderOpen, TrendingUp, Plus, ArrowRight, Users, Target, CalendarIcon, ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TaskCard } from "@/components/tasks/task-card"
import {
  StatsCard,
  TaskCompletionChart,
  ProjectProgressChart,
  TeamProductivityChart,
  ActivityTimeline,
} from "@/components/analytics"
import { mockProjects, mockTasks } from "@/mocks/data"
import { useDashboard } from "@/hooks/use-dashboard"
import { DateRange } from "@/types"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

const upcomingDeadlines = [
  { title: "Hoàn thành API giỏ hàng", date: "25/11/2024", project: "E-commerce" },
  { title: "Review bảo mật app", date: "23/11/2024", project: "Mobile Banking" },
  { title: "Tối ưu dashboard CRM", date: "24/11/2024", project: "Hệ thống CRM" },
]

export default function DashboardPage() {
  const router = useRouter()
  const { stats, activities, isLoading, error, refetch, updateDateRange } = useDashboard()
  const urgentTasks = mockTasks.filter((t) => t.priority === "urgent" && t.status !== "done").slice(0, 3)
  const recentProjects = mockProjects.slice(0, 3)

  // Analytics data
  const taskCompletionData = [
    { name: "T2", completed: 12, inProgress: 5, todo: 8 },
    { name: "T3", completed: 15, inProgress: 7, todo: 6 },
    { name: "T4", completed: 18, inProgress: 4, todo: 5 },
    { name: "T5", completed: 14, inProgress: 6, todo: 7 },
    { name: "T6", completed: 20, inProgress: 3, todo: 4 },
    { name: "T7", completed: 10, inProgress: 2, todo: 3 },
    { name: "CN", completed: 8, inProgress: 1, todo: 2 },
  ]

  const projectProgressData = [
    { name: "Đang thực hiện", value: 5, color: "hsl(221, 83%, 53%)" },
    { name: "Hoàn thành", value: 12, color: "hsl(142, 76%, 36%)" },
    { name: "Tạm dừng", value: 2, color: "hsl(48, 96%, 53%)" },
    { name: "Đã hủy", value: 1, color: "hsl(0, 84%, 60%)" },
  ]

  const productivityData = [
    { date: "20/11", tasksCompleted: 12, hoursWorked: 8 },
    { date: "21/11", tasksCompleted: 15, hoursWorked: 9 },
    { date: "22/11", tasksCompleted: 18, hoursWorked: 10 },
    { date: "23/11", tasksCompleted: 14, hoursWorked: 7 },
    { date: "24/11", tasksCompleted: 20, hoursWorked: 11 },
    { date: "25/11", tasksCompleted: 16, hoursWorked: 8 },
    { date: "26/11", tasksCompleted: 19, hoursWorked: 9 },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Tổng quan</h1>
          <p className="text-muted-foreground">Chào mừng quay lại! Đây là tóm tắt hoạt động của bạn.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Thời gian
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => updateDateRange("today")}>Hôm nay</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateDateRange("week")}>Tuần này</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateDateRange("month")}>Tháng này</DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateDateRange("year")}>Năm nay</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => router.push("/tasks")}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo công việc mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refetch}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Công việc hôm nay"
              value={String(stats?.thisWeekCompleted || 0)}
              icon={Clock}
              trend={{ value: 15, isPositive: true }}
              description="so với hôm qua"
              delay={0}
            />
            <StatsCard
              title="Hoàn thành tuần này"
              value={String(stats?.thisWeekCompleted || 0)}
              icon={CheckCircle2}
              trend={{ value: 12, isPositive: true }}
              description="so với tuần trước"
              delay={0.1}
            />
            <StatsCard
              title="Dự án đang làm"
              value={String(stats?.activeProjects || 0)}
              icon={FolderOpen}
              trend={{ value: 5, isPositive: false }}
              description="so với tháng trước"
              delay={0.2}
            />
            <StatsCard
              title="Thành viên hoạt động"
              value={String(stats?.teamMembers || 0)}
              icon={Users}
              trend={{ value: 8, isPositive: true }}
              description="tăng trưởng"
              delay={0.3}
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TaskCompletionChart data={taskCompletionData} />
            <ProjectProgressChart data={projectProgressData} />
          </div>

          {/* Productivity Chart */}
          <TeamProductivityChart data={productivityData} />

          {/* Activity Timeline and Recent Tasks */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {activities && activities.length > 0 ? (
                <ActivityTimeline 
                  activities={activities.map((a) => ({
                    id: a.id || "",
                    type: "task_completed" as const,
                    user: { name: a.user?.name || "Unknown", avatar: a.user?.avatarUrl || "" },
                    description: a.action || "updated",
                    timestamp: a.createdAt,
                    metadata: { taskTitle: (a.metadata as any)?.taskTitle || "Task" },
                  }))} 
                  maxHeight="500px" 
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Nhật ký hoạt động</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-8">
                    Không có hoạt động nào
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Urgent Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Công việc khẩn cấp</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {urgentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {urgentTasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Không có công việc khẩn cấp</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Dự án gần đây</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">
                  Xem tất cả
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project, index) => {
            const completedTasks = mockTasks.filter((t) => t.projectId === project.id && t.status === "done").length
            const totalTasks = mockTasks.filter((t) => t.projectId === project.id).length
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : project.status === "on-hold"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {project.status === "active"
                            ? "Đang thực hiện"
                            : project.status === "on-hold"
                              ? "Tạm dừng"
                              : "Hoàn thành"}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {completedTasks}/{totalTasks} công việc
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
