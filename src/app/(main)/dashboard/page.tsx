"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, FolderOpen, TrendingUp, Plus, ArrowRight, Users, Target, CalendarIcon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TaskCard } from "@/components/tasks/task-card"
import {
  StatsCard,
  TaskCompletionChart,
  ProjectProgressChart,
  TeamProductivityChart,
  ActivityTimeline,
} from "@/components/analytics"
import { mockProjects, mockTasks, mockUsers } from "@/mocks/data"
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

const stats = [
  {
    title: "Công việc hôm nay",
    value: "12",
    change: "+3 so với hôm qua",
    icon: Clock,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Hoàn thành tuần này",
    value: "28",
    change: "+12% so với tuần trước",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Dự án đang thực hiện",
    value: "5",
    change: "2 sắp đến hạn",
    icon: FolderOpen,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  },
  {
    title: "Hiệu suất",
    value: "94%",
    change: "+5% so với tháng trước",
    icon: TrendingUp,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
]

const upcomingDeadlines = [
  { title: "Hoàn thành API giỏ hàng", date: "25/11/2024", project: "E-commerce" },
  { title: "Review bảo mật app", date: "23/11/2024", project: "Mobile Banking" },
  { title: "Tối ưu dashboard CRM", date: "24/11/2024", project: "Hệ thống CRM" },
]

const recentActivity = [
  {
    user: mockUsers[1],
    action: "đã hoàn thành",
    target: "Thiết kế giao diện trang chủ",
    time: "5 phút trước",
  },
  {
    user: mockUsers[2],
    action: "đã bình luận vào",
    target: "API giỏ hàng",
    time: "15 phút trước",
  },
  {
    user: mockUsers[4],
    action: "đã tạo công việc",
    target: "Fix bug responsive",
    time: "1 giờ trước",
  },
  {
    user: mockUsers[0],
    action: "đã cập nhật",
    target: "Dự án E-commerce",
    time: "2 giờ trước",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const urgentTasks = mockTasks.filter((t) => t.priority === "urgent" && t.status !== "done").slice(0, 3)
  const recentProjects = mockProjects.slice(0, 3)

  // Date filter state
  const [dateFilter, setDateFilter] = useState<string>("today")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date()
    switch (dateFilter) {
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) }
      case "yesterday":
        return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) }
      case "thisWeek":
        return { from: startOfWeek(now, { locale: vi }), to: endOfWeek(now, { locale: vi }) }
      case "lastWeek":
        const lastWeek = subWeeks(now, 1)
        return { from: startOfWeek(lastWeek, { locale: vi }), to: endOfWeek(lastWeek, { locale: vi }) }
      case "thisMonth":
        return { from: startOfMonth(now), to: endOfMonth(now) }
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
      case "thisYear":
        return { from: startOfYear(now), to: endOfYear(now) }
      case "lastYear":
        const lastYear = subYears(now, 1)
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) }
      case "custom":
        return { from: customDateRange.from, to: customDateRange.to }
      default:
        return { from: startOfDay(now), to: endOfDay(now) }
    }
  }

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter)
    if (filter !== "custom") {
      const range = getDateRange()
      toast.success("Đã cập nhật bộ lọc thời gian")
    }
  }

  const handleCustomDateApply = () => {
    if (customDateRange.from && customDateRange.to) {
      setDateFilter("custom")
      toast.success("Đã áp dụng khoảng thời gian tùy chỉnh")
    } else {
      toast.error("Vui lòng chọn cả ngày bắt đầu và kết thúc")
    }
  }

  const getFilterLabel = () => {
    switch (dateFilter) {
      case "today": return "Hôm nay"
      case "yesterday": return "Hôm qua"
      case "thisWeek": return "Tuần này"
      case "lastWeek": return "Tuần trước"
      case "thisMonth": return "Tháng này"
      case "lastMonth": return "Tháng trước"
      case "thisYear": return "Năm nay"
      case "lastYear": return "Năm trước"
      case "custom":
        if (customDateRange.from && customDateRange.to) {
          return `${format(customDateRange.from, "dd/MM/yyyy")} - ${format(customDateRange.to, "dd/MM/yyyy")}`
        }
        return "Tùy chỉnh"
      default: return "Hôm nay"
    }
  }

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

  const activityData = [
    {
      id: "1",
      type: "task_completed" as const,
      user: { name: mockUsers[1].name, avatar: mockUsers[1].avatarUrl },
      description: "đã hoàn thành task",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metadata: { taskTitle: "Thiết kế giao diện trang chủ", priority: "high" },
    },
    {
      id: "2",
      type: "comment" as const,
      user: { name: mockUsers[2].name, avatar: mockUsers[2].avatarUrl },
      description: "đã bình luận vào task",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: { taskTitle: "Tích hợp API thanh toán", projectName: "E-commerce" },
    },
    {
      id: "3",
      type: "task_created" as const,
      user: { name: mockUsers[4].name, avatar: mockUsers[4].avatarUrl },
      description: "đã tạo task mới",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      metadata: { taskTitle: "Fix bug responsive", priority: "urgent" },
    },
    {
      id: "4",
      type: "project_created" as const,
      user: { name: mockUsers[0].name, avatar: mockUsers[0].avatarUrl },
      description: "đã tạo dự án mới",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { projectName: "Mobile App Redesign" },
    },
    {
      id: "5",
      type: "user_joined" as const,
      user: { name: mockUsers[3].name, avatar: mockUsers[3].avatarUrl },
      description: "đã tham gia dự án",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      metadata: { projectName: "E-commerce Platform" },
    },
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
          {/* Date Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getFilterLabel()}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ngày</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDateFilterChange("today")}>
                Hôm nay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange("yesterday")}>
                Hôm qua
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tuần</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDateFilterChange("thisWeek")}>
                Tuần này
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange("lastWeek")}>
                Tuần trước
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tháng</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDateFilterChange("thisMonth")}>
                Tháng này
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange("lastMonth")}>
                Tháng trước
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Năm</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleDateFilterChange("thisYear")}>
                Năm nay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateFilterChange("lastYear")}>
                Năm trước
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Tùy chỉnh</DropdownMenuLabel>
              <div className="p-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateRange.from && customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "dd/MM/yyyy")} - {format(customDateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        <span>Chọn khoảng thời gian</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: customDateRange.from, to: customDateRange.to }}
                      onSelect={(range) => setCustomDateRange({ from: range?.from, to: range?.to })}
                      numberOfMonths={2}
                      locale={vi}
                    />
                    <div className="border-t p-3">
                      <Button onClick={handleCustomDateApply} size="sm" className="w-full">
                        Áp dụng
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => router.push("/tasks")}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo công việc mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Công việc hôm nay"
          value="12"
          icon={Clock}
          trend={{ value: 15, isPositive: true }}
          description="so với hôm qua"
          delay={0}
        />
        <StatsCard
          title="Hoàn thành tuần này"
          value="28"
          icon={CheckCircle2}
          trend={{ value: 12, isPositive: true }}
          description="so với tuần trước"
          delay={0.1}
        />
        <StatsCard
          title="Dự án đang làm"
          value={recentProjects.length}
          icon={FolderOpen}
          trend={{ value: 5, isPositive: false }}
          description="so với tháng trước"
          delay={0.2}
        />
        <StatsCard
          title="Thành viên hoạt động"
          value={mockUsers.length}
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
          <ActivityTimeline activities={activityData} maxHeight="500px" />
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

        {/* Upcoming Deadlines & Activity */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sắp đến hạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.project} - {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatarUrl || "/placeholder.svg"} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">{getInitials(activity.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 3).map((memberId) => {
                            const member = mockUsers.find((u) => u.id === memberId)
                            return member ? (
                              <Avatar key={memberId} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                              </Avatar>
                            ) : null
                          })}
                          {project.members.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">+{project.members.length - 3}</span>
                            </div>
                          )}
                        </div>
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
    </div>
  )
}
