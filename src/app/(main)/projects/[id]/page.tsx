"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Settings, Users, Calendar, MoreHorizontal, Edit, Trash2, UserPlus, Search, SlidersHorizontal, Kanban as KanbanIcon, List as ListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { TaskCreateModal } from "@/components/tasks/task-create-modal"
import { FilterPanel } from "@/components/filters/filter-panel"
import { FilterChips } from "@/components/filters/filter-chips"
import { SortControl } from "@/components/sorting/sort-control"
import { mockProjects, mockTasks, mockUsers } from "@/mocks/data"
import { useFilters } from "@/hooks/use-filters"
import Link from "next/link"
import type { Task } from "@/types"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low"
type StatusFilter = "all" | "todo" | "in_progress" | "review" | "done"

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const project = mockProjects.find((p) => p.id === id)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  })
  
  const { filters } = useFilters()

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold">Không tìm thấy dự án</h2>
        <Button asChild className="mt-4">
          <Link href="/projects">Quay lại danh sách</Link>
        </Button>
      </div>
    )
  }

  const projectTasks = mockTasks.filter((t) => t.projectId === project.id)
  
  // Apply filters
  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesAssignee = assigneeFilter === "all" || task.assignees.some(a => a.id === assigneeFilter)
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee
  })
  
  const completedTasks = projectTasks.filter((t) => t.status === "done").length
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    "in-progress": filteredTasks.filter((t) => t.status === "in_progress"),
    review: filteredTasks.filter((t) => t.status === "review"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditTaskOpen(true)
    setIsTaskDetailOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    // TODO: Call API to delete task
    toast.success("Xóa công việc thành công")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.name}</h1>
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
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-12 md:ml-0">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Mời
          </Button>
          <Button onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm công việc
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditProjectOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa dự án
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="font-medium text-sm">
                  {new Date(project.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(project.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thành viên</p>
                <p className="font-medium">{project.members.length} người</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Công việc</p>
                <p className="font-medium">
                  {completedTasks}/{projectTasks.length}
                </p>
              </div>
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((memberId) => {
                  const member = mockUsers.find((u) => u.id === memberId)
                  return member ? (
                    <Avatar key={memberId} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                  ) : null
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Task Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Chờ làm", count: tasksByStatus.todo.length, color: "bg-gray-500" },
                      { label: "Đang làm", count: tasksByStatus["in-progress"].length, color: "bg-blue-500" },
                      { label: "Review", count: tasksByStatus.review.length, color: "bg-amber-500" },
                      { label: "Hoàn thành", count: tasksByStatus.done.length, color: "bg-green-500" },
                    ].map((status) => (
                      <div key={status.label} className="text-center">
                        <div className={`h-2 w-full rounded-full ${status.color} mb-2`} />
                        <p className="text-2xl font-bold">{status.count}</p>
                        <p className="text-sm text-muted-foreground">{status.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Công việc gần đây</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("list")}>
                    Xem tất cả
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {projectTasks.slice(0, 5).map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                  ))}
                  {projectTasks.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">Chưa có công việc nào</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Đội ngũ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.members.map((memberId) => {
                    const member = mockUsers.find((u) => u.id === memberId)
                    if (!member) return null
                    return (
                      <div key={memberId} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Đã hoàn thành công việc "Thiết kế UI"', time: "2 giờ trước" },
                      { action: "Đã thêm bình luận mới", time: "4 giờ trước" },
                      { action: "Đã tạo công việc mới", time: "Hôm qua" },
                    ].map((activity, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          {/* Enhanced Filter Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Top Row - Main Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm công việc..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Panel Button */}
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterPanelOpen(true)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Bộ lọc
                  </Button>

                  {/* Sort Control */}
                  <SortControl
                    type="task"
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                  />
                </div>

                {/* Quick Filters Row */}
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="todo">Chờ làm</SelectItem>
                      <SelectItem value="in_progress">Đang làm</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Người thực hiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {project.members.map((memberId) => {
                        const member = mockUsers.find((u) => u.id === memberId)
                        return member ? (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ) : null
                      })}
                    </SelectContent>
                  </Select>

                  {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                        setAssigneeFilter("all")
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>

                {/* Filter Chips */}
                {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {searchQuery && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Tìm kiếm: {searchQuery}
                        <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {statusFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Trạng thái: {statusFilter}
                        <button onClick={() => setStatusFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {priorityFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Độ ưu tiên: {priorityFilter}
                        <button onClick={() => setPriorityFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {assigneeFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Người thực hiện: {mockUsers.find(u => u.id === assigneeFilter)?.name}
                        <button onClick={() => setAssigneeFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <KanbanBoard tasks={filteredTasks} onTaskClick={handleTaskClick} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {/* Enhanced Filter Bar - Same as Kanban */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Top Row - Main Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm công việc..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Panel Button */}
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterPanelOpen(true)}
                    className="gap-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Bộ lọc
                  </Button>

                  {/* Sort Control */}
                  <SortControl
                    type="task"
                    sortConfig={sortConfig}
                    onSortChange={setSortConfig}
                  />
                </div>

                {/* Quick Filters Row */}
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="todo">Chờ làm</SelectItem>
                      <SelectItem value="in_progress">Đang làm</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as PriorityFilter)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả độ ưu tiên</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Người thực hiện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {project.members.map((memberId) => {
                        const member = mockUsers.find((u) => u.id === memberId)
                        return member ? (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ) : null
                      })}
                    </SelectContent>
                  </Select>

                  {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                        setAssigneeFilter("all")
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>

                {/* Filter Chips */}
                {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {searchQuery && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Tìm kiếm: {searchQuery}
                        <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {statusFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Trạng thái: {statusFilter}
                        <button onClick={() => setStatusFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {priorityFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Độ ưu tiên: {priorityFilter}
                        <button onClick={() => setPriorityFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                    {assigneeFilter !== "all" && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        Người thực hiện: {mockUsers.find(u => u.id === assigneeFilter)?.name}
                        <button onClick={() => setAssigneeFilter("all")} className="hover:bg-primary/20 rounded p-0.5">×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                ))}
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery || priorityFilter !== "all" || statusFilter !== "all" || assigneeFilter !== "all"
                      ? "Không tìm thấy công việc phù hợp"
                      : "Chưa có công việc nào"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.members.map((memberId, index) => {
              const member = mockUsers.find((u) => u.id === memberId)
              if (!member) return null
              const memberTasks = projectTasks.filter((t) => t.assigneeId === memberId)
              const completedMemberTasks = memberTasks.filter((t) => t.status === "done").length

              return (
                <motion.div
                  key={memberId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Công việc</span>
                          <span>
                            {completedMemberTasks}/{memberTasks.length}
                          </span>
                        </div>
                        <Progress
                          value={memberTasks.length > 0 ? (completedMemberTasks / memberTasks.length) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
      />

      {/* Create Task Modal */}
      <TaskCreateModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={project?.id}
      />

      {/* Task Detail Dialog */}
      <TaskDetailDialog 
        task={selectedTask} 
        open={isTaskDetailOpen} 
        onOpenChange={setIsTaskDetailOpen}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dự án</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin dự án {project.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên dự án</Label>
              <Input defaultValue={project.name} />
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea defaultValue={project.description} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" defaultValue={project.startDate.split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input type="date" defaultValue={project.endDate.split('T')[0]} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select defaultValue={project.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang thực hiện</SelectItem>
                  <SelectItem value="on-hold">Tạm dừng</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Màu sắc</Label>
              <div className="flex gap-2">
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color, borderColor: project.color === color ? '#000' : 'transparent' }}
                    onClick={() => toast.success('Đã chọn màu')}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => {
              toast.success('Đã cập nhật dự án')
              setIsEditProjectOpen(false)
            }}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <TaskCreateModal 
        open={isEditTaskOpen} 
        onOpenChange={setIsEditTaskOpen}
        mode="edit"
        editTask={editingTask}
        onSuccess={() => {
          toast.success("Công việc đã được cập nhật")
        }}
      />

      {/* Filter Panel Sheet */}
      <Sheet open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Bộ lọc nâng cao</SheetTitle>
            <SheetDescription>
              Tùy chỉnh các bộ lọc để tìm công việc phù hợp
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Trạng thái</h4>
                <div className="space-y-2">
                  {[
                    { value: "todo", label: "Chờ làm" },
                    { value: "in_progress", label: "Đang làm" },
                    { value: "review", label: "Review" },
                    { value: "done", label: "Hoàn thành" },
                  ].map((status) => (
                    <div key={status.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={statusFilter === status.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilter(status.value as StatusFilter)
                          } else {
                            setStatusFilter("all")
                          }
                        }}
                      />
                      <Label htmlFor={`status-${status.value}`} className="cursor-pointer">
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Độ ưu tiên</h4>
                <div className="space-y-2">
                  {[
                    { value: "urgent", label: "Khẩn cấp" },
                    { value: "high", label: "Cao" },
                    { value: "medium", label: "Trung bình" },
                    { value: "low", label: "Thấp" },
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={priorityFilter === priority.value}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilter(priority.value as PriorityFilter)
                          } else {
                            setPriorityFilter("all")
                          }
                        }}
                      />
                      <Label htmlFor={`priority-${priority.value}`} className="cursor-pointer">
                        {priority.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Người thực hiện</h4>
                <div className="space-y-2">
                  {project.members.map((memberId) => {
                    const member = mockUsers.find((u) => u.id === memberId)
                    if (!member) return null
                    return (
                      <div key={member.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`assignee-${member.id}`}
                          checked={assigneeFilter === member.id}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAssigneeFilter(member.id)
                            } else {
                              setAssigneeFilter("all")
                            }
                          }}
                        />
                        <Label htmlFor={`assignee-${member.id}`} className="cursor-pointer flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatarUrl || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          {member.name}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setAssigneeFilter("all")
                  setIsFilterPanelOpen(false)
                }}
              >
                Xóa tất cả
              </Button>
              <Button
                className="flex-1"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
