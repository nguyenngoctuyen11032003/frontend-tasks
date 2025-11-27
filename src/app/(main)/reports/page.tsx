"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockProjects, mockTasks, mockUsers, mockRoleDefinitions } from "@/mocks/data"
import { toast } from "sonner"
import { ExportDialog } from "@/components/export"
import { QuickExport } from "@/components/export"
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
  Legend,
} from "recharts"

const tasksByStatusData = [
  { name: "Chờ làm", value: mockTasks.filter((t) => t.status === "todo").length, color: "#64748b" },
  { name: "Đang làm", value: mockTasks.filter((t) => t.status === "in_progress").length, color: "#3b82f6" },
  { name: "Review", value: mockTasks.filter((t) => t.status === "review").length, color: "#f59e0b" },
  { name: "Hoàn thành", value: mockTasks.filter((t) => t.status === "done").length, color: "#10b981" },
]

const weeklyData = [
  { name: "T2", completed: 5, created: 8 },
  { name: "T3", completed: 8, created: 6 },
  { name: "T4", completed: 12, created: 10 },
  { name: "T5", completed: 7, created: 9 },
  { name: "T6", completed: 15, created: 12 },
  { name: "T7", completed: 3, created: 2 },
  { name: "CN", completed: 2, created: 1 },
]

const monthlyTrendData = [
  { name: "T1", tasks: 45 },
  { name: "T2", tasks: 52 },
  { name: "T3", tasks: 48 },
  { name: "T4", tasks: 61 },
  { name: "T5", tasks: 55 },
  { name: "T6", tasks: 67 },
  { name: "T7", tasks: 72 },
  { name: "T8", tasks: 78 },
  { name: "T9", tasks: 85 },
  { name: "T10", tasks: 92 },
  { name: "T11", tasks: 88 },
  { name: "T12", tasks: 95 },
]

// Priority distribution data
const priorityData = [
  { name: "Khẩn cấp", value: mockTasks.filter((t) => t.priority === "urgent").length, color: "#ef4444" },
  { name: "Cao", value: mockTasks.filter((t) => t.priority === "high").length, color: "#f97316" },
  { name: "Trung bình", value: mockTasks.filter((t) => t.priority === "medium").length, color: "#eab308" },
  { name: "Thấp", value: mockTasks.filter((t) => t.priority === "low").length, color: "#22c55e" },
]

// Project status data
const projectStatusData = [
  { name: "Đang thực hiện", value: mockProjects.filter((p) => p.status === "active").length, color: "#3b82f6" },
  { name: "Tạm dừng", value: mockProjects.filter((p) => p.status === "on-hold").length, color: "#f59e0b" },
  { name: "Hoàn thành", value: mockProjects.filter((p) => p.status === "completed").length, color: "#10b981" },
]

// Task completion rate trend
const completionRateData = weeklyData.map((day) => ({
  name: day.name,
  rate: day.created > 0 ? Math.round((day.completed / day.created) * 100) : 0,
}))

// Top performers data
const topPerformersData = mockUsers
  .map((user) => {
    const userTasks = mockTasks.filter((t) => t.assignees.some((a) => a.id === user.id))
    const completed = userTasks.filter((t) => t.status === "done").length
    return {
      name: user.name.split(" ").slice(-1)[0], // Last name
      tasks: completed,
    }
  })
  .sort((a, b) => b.tasks - a.tasks)
  .slice(0, 6)


export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week")
  const [selectedProject, setSelectedProject] = useState("all")
  const [showExportDialog, setShowExportDialog] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate stats
  const totalTasks = mockTasks.length
  const completedTasks = mockTasks.filter((t) => t.status === "done").length
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  const teamPerformance = mockUsers.slice(0, 5).map((user) => {
    const userTasks = mockTasks.filter((t) => t.assignees.some((a) => a.id === user.id))
    const completed = userTasks.filter((t) => t.status === "done").length
    const role = mockRoleDefinitions.find((r) => user.roles.includes(r.name))
    return {
      ...user,
      roleDisplayName: role?.displayName || user.role,
      totalTasks: userTasks.length,
      completedTasks: completed,
      rate: userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0,
    }
  })

  // Export data
  const exportFields = [
    { key: "id", label: "ID" },
    { key: "title", label: "Tiêu đề" },
    { key: "status", label: "Trạng thái" },
    { key: "priority", label: "Độ ưu tiên" },
    { key: "dueDate", label: "Hạn chót" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Báo cáo</h1>
          <p className="text-muted-foreground">Phân tích và thống kê hiệu suất làm việc</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dự án" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả dự án</SelectItem>
              {mockProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <QuickExport
            data={mockTasks}
            filename="bao-cao-cong-viec"
            variant="default"
          />
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Xuất nâng cao
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Tổng công việc",
            value: totalTasks,
            change: "+12%",
            trend: "up",
            icon: BarChart3,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Hoàn thành",
            value: completedTasks,
            change: "+8%",
            trend: "up",
            icon: CheckCircle2,
            color: "text-green-600 bg-green-100 dark:bg-green-900/30",
          },
          {
            title: "Tỷ lệ hoàn thành",
            value: `${completionRate}%`,
            change: "+5%",
            trend: "up",
            icon: TrendingUp,
            color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
          },
          {
            title: "Thành viên hoạt động",
            value: mockUsers.filter((u) => u.status === "online").length,
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân bổ theo trạng thái</CardTitle>
                <CardDescription>Tổng {totalTasks} công việc</CardDescription>
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
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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

            {/* Priority Distribution */}
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
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                      <span className="text-xs font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trạng thái dự án</CardTitle>
                <CardDescription>Tổng {mockProjects.length} dự án</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`project-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - 2 Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ tuần</CardTitle>
                <CardDescription>Công việc tạo mới và hoàn thành</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="created" name="Tạo mới" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Thành viên xuất sắc</CardTitle>
                <CardDescription>Số lượng công việc hoàn thành</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPerformersData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                      <Tooltip />
                      <Bar dataKey="tasks" name="Hoàn thành" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - 2 Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng năm</CardTitle>
                <CardDescription>Số lượng công việc hoàn thành theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        name="Công việc"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Completion Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ hoàn thành</CardTitle>
                <CardDescription>Hiệu suất hoàn thành theo tuần</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={completionRateData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        name="Tỷ lệ %"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất đội ngũ</CardTitle>
              <CardDescription>Thống kê công việc theo thành viên</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamPerformance.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.roleDisplayName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{member.rate}%</p>
                          <p className="text-sm text-muted-foreground">
                            {member.completedTasks}/{member.totalTasks} việc
                          </p>
                        </div>
                      </div>
                      <Progress value={member.rate} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockProjects.map((project, index) => {
              const projectTasks = mockTasks.filter((t) => t.projectId === project.id)
              const completed = projectTasks.filter((t) => t.status === "done").length
              const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{projectTasks.length} công việc</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="text-lg font-bold text-green-600">{completed}</p>
                            <p className="text-xs text-muted-foreground">Hoàn thành</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <p className="text-lg font-bold text-amber-600">{projectTasks.length - completed}</p>
                            <p className="text-xs text-muted-foreground">Còn lại</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={mockTasks}
        filename="bao-cao-cong-viec"
        availableFields={exportFields}
        defaultFields={["title", "status", "priority", "dueDate"]}
      />
    </div>
  )
}
