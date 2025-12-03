"use client"
import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Kanban, List, Calendar, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { TaskCreateModal } from "@/components/tasks/task-create-modal"
import { FilterPanel } from "@/components/filters/filter-panel"
import { FilterChips } from "@/components/filters/filter-chips"
import { SortControl } from "@/components/sorting/sort-control"
import { useFilters } from "@/hooks/use-filters"
import { FilterManager } from "@/lib/filters"
import { SortManager, type SortConfig } from "@/lib/sorting"
import type { Task, TaskStatus } from "@/types"
import { toast } from "sonner"
import { useTasksStore } from "@/stores/tasks-store"
import { useProjectsStore } from "@/stores/projects-store"

type ViewMode = "kanban" | "list" | "calendar"

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    SortManager.getSortPreference("task") || SortManager.getDefaultSort("task")
  )

  const { taskFilters } = useFilters()
  
  // Tasks store
  const {
    tasks,
    loading,
    error,
    searchQuery,
    pagination,
    fetchTasks,
    setSearchQuery,
    setPagination,
    updateTask,
  } = useTasksStore()

  // Projects store for project filter dropdown
  const { projects, fetchProjects } = useProjectsStore()

  // Fetch tasks on mount and when filters/search/pagination/sort change
  useEffect(() => {
    fetchTasks({
      search: searchQuery,
      projectId: projectFilter !== "all" ? projectFilter : undefined,
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.direction === "asc" ? "ASC" : "DESC",
    }).catch((err) => {
      console.error("Failed to fetch tasks:", err)
    })
  }, [searchQuery, projectFilter, pagination.page, pagination.limit, sortConfig, fetchTasks])

  // Fetch projects for filter dropdown
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects({ limit: 100 }).catch((err) => {
        console.error("Failed to fetch projects:", err)
      })
    }
  }, [projects.length, fetchProjects])

  // Save sort preference when it changes
  useEffect(() => {
    SortManager.saveSortPreference("task", sortConfig)
  }, [sortConfig])

  // Apply filters and sorting (client-side for additional filtering)
  const filteredAndSortedTasks = useMemo(() => {
    let tasksList = [...tasks]

    // Apply advanced filters from FilterManager
    tasksList = FilterManager.filterTasks(tasksList, taskFilters)

    // Apply sorting (already sorted by API, but apply client-side for filtered results)
    tasksList = SortManager.sortTasks(tasksList, sortConfig)

    return tasksList
  }, [tasks, taskFilters, sortConfig])

  const groupedByDate = useMemo(() => {
    return filteredAndSortedTasks.reduce(
      (acc, task) => {
        const date = task.dueDate ? new Date(task.dueDate).toLocaleDateString("vi-VN") : "Không có hạn"
        if (!acc[date]) acc[date] = []
        acc[date].push(task)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  }, [filteredAndSortedTasks])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditOpen(true)
    setIsDetailOpen(false)
  }

  const handleDeleteTask = async (taskId: string) => {
    // Task deletion is handled in TaskDetailDialog component
    toast.success("Xóa công việc thành công")
  }

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
      toast.success("Đã cập nhật trạng thái công việc")
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleCreateSuccess = () => {
    // Refresh tasks after creation
    fetchTasks({
      search: searchQuery,
      projectId: projectFilter !== "all" ? projectFilter : undefined,
      page: pagination.page,
      limit: pagination.limit,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.direction === "asc" ? "ASC" : "DESC",
    }).catch((err) => console.error("Failed to refresh tasks:", err))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Công việc</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi tất cả công việc của bạn</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo công việc
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => fetchTasks()}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Top row - Search, Advanced Filters, Sort and View Mode */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm công việc..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPagination({ page: 1 })
                  }}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterPanelOpen(true)}
                  className="flex-shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Bộ lọc</span>
                </Button>
                <SortControl
                  type="task"
                  sortConfig={sortConfig}
                  onSortChange={setSortConfig}
                />
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "kanban" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                    aria-label="Chế độ Kanban"
                  >
                    <Kanban className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("list")}
                    aria-label="Chế độ danh sách"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "calendar" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                    aria-label="Chế độ lịch"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Filter - Project and Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Select value={projectFilter} onValueChange={(value) => {
                setProjectFilter(value)
                setPagination({ page: 1 })
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Dự án" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dự án</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải...
                  </span>
                ) : (
                  <span>
                    {filteredAndSortedTasks.length} / {pagination.total} công việc
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Chips */}
      <FilterChips type="task" />

      {/* Content */}
      {loading && tasks.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Đang tải công việc...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredAndSortedTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Kanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Không tìm thấy công việc</h3>
            <p className="text-muted-foreground text-center mt-1">
              {searchQuery || projectFilter !== "all" 
                ? "Thử thay đổi bộ lọc hoặc tạo công việc mới"
                : "Bắt đầu bằng cách tạo công việc đầu tiên"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "kanban" ? (
        <KanbanBoard 
          tasks={filteredAndSortedTasks} 
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
        />
      ) : viewMode === "list" ? (
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-3">
              {filteredAndSortedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <TaskCard task={task} onClick={() => handleTaskClick(task)} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, tasks]) => (
            <div key={date}>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground">{date}</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedByDate).length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">Không tìm thấy công việc nào</CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && tasks.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Tiếp
            </Button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel open={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} type="task" />

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Create Task Modal */}
      <TaskCreateModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Task Modal */}
      <TaskCreateModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        mode="edit"
        editTask={editingTask}
        onSuccess={() => {
          toast.success("Công việc đã được cập nhật")
          handleCreateSuccess()
        }}
      />
    </div>
  )
}
