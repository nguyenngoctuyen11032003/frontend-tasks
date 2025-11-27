"use client"
import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Kanban, List, Calendar, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { TaskCreateModal } from "@/components/tasks/task-create-modal"
import { FilterPanel } from "@/components/filters/filter-panel"
import { FilterChips } from "@/components/filters/filter-chips"
import { SortControl } from "@/components/sorting/sort-control"
import { mockTasks, mockProjects } from "@/mocks/data"
import { useFilters } from "@/hooks/use-filters"
import { FilterManager } from "@/lib/filters"
import { SortManager, type SortConfig, type TaskSortField } from "@/lib/sorting"
import type { Task, TaskStatus } from "@/types"
import { toast } from "sonner"
import { useUpdateTaskStatus } from "@/hooks/use-tasks"

type ViewMode = "kanban" | "list" | "calendar"

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig<TaskSortField>>(
    SortManager.getSortPreference("task") || SortManager.getDefaultSort("task")
  )

  const { taskFilters } = useFilters()
  const updateTaskStatus = useUpdateTaskStatus()

  // Save sort preference when it changes
  useEffect(() => {
    SortManager.saveSortPreference("task", sortConfig)
  }, [sortConfig])

  // Apply filters and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let tasks = [...mockTasks]

    // Apply project filter
    if (projectFilter !== "all") {
      tasks = tasks.filter((task) => task.projectId === projectFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      )
    }

    // Apply advanced filters from FilterManager
    tasks = FilterManager.filterTasks(tasks, taskFilters)

    // Apply sorting
    tasks = SortManager.sortTasks(tasks, sortConfig)

    return tasks
  }, [projectFilter, searchQuery, taskFilters, sortConfig])

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

  const handleDeleteTask = (taskId: string) => {
    // TODO: Call API to delete task
    toast.success("Xóa công việc thành công")
  }

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus.mutate(
      { taskId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật trạng thái công việc")
        },
        onError: () => {
          toast.error("Không thể cập nhật trạng thái")
        },
      }
    )
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedTasks.length} / {mockTasks.length} công việc
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Chips */}
      <FilterChips type="task" />

      {/* Content */}
      {viewMode === "kanban" && (
        <KanbanBoard 
          tasks={filteredAndSortedTasks} 
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
        />
      )}

      {viewMode === "list" && (
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
              {filteredAndSortedTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Không tìm thấy công việc nào</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "calendar" && (
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
      <TaskCreateModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Edit Task Modal */}
      <TaskCreateModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        mode="edit"
        editTask={editingTask}
        onSuccess={() => {
          toast.success("Công việc đã được cập nhật")
        }}
      />
    </div>
  )
}
