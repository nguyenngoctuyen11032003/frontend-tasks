"use client"
import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FilterPanel } from "@/components/filters/filter-panel"
import { FilterChips } from "@/components/filters/filter-chips"
import { SortControl } from "@/components/sorting/sort-control"
import { mockProjects, mockTasks, mockUsers } from "@/mocks/data"
import { useFilters } from "@/hooks/use-filters"
import { FilterManager } from "@/lib/filters"
import { SortManager, type SortConfig, type ProjectSortField } from "@/lib/sorting"
import Link from "next/link"

type ViewMode = "grid" | "list"

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig<ProjectSortField>>(
    SortManager.getSortPreference("project") || SortManager.getDefaultSort("project")
  )

  const { projectFilters } = useFilters()

  // Save sort preference when it changes
  useEffect(() => {
    SortManager.saveSortPreference("project", sortConfig)
  }, [sortConfig])

  // Apply filters and sorting
  const filteredAndSortedProjects = useMemo(() => {
    let projects = [...mockProjects]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      projects = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      )
    }

    // Apply advanced filters from FilterManager
    projects = FilterManager.filterProjects(projects, projectFilters)

    // Apply sorting
    projects = SortManager.sortProjects(projects, sortConfig)

    return projects
  }, [searchQuery, projectFilters, sortConfig])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getProjectStats = (projectId: string) => {
    const projectTasks = mockTasks.filter((t) => t.projectId === projectId)
    const completed = projectTasks.filter((t) => t.status === "done").length
    const total = projectTasks.length
    return { completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dự án</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi tất cả dự án của bạn</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo dự án
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo dự án mới</DialogTitle>
              <DialogDescription>Điền thông tin để tạo dự án mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên dự án</Label>
                <Input id="name" placeholder="Nhập tên dự án..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" placeholder="Mô tả ngắn về dự án..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Ngày bắt đầu</Label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Ngày kết thúc</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2">
                  {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      className="h-8 w-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>Tạo dự án</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Top row - Search, Filters, Sort and View Mode */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm dự án..."
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
                  type="project"
                  sortConfig={sortConfig}
                  onSortChange={setSortConfig}
                />
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button 
                    variant={viewMode === "grid" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("grid")}
                    aria-label="Chế độ lưới"
                    aria-label="Chế độ lưới"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "secondary" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewMode("list")}
                    aria-label="Chế độ danh sách"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedProjects.length} / {mockProjects.length} dự án
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Chips */}
      <FilterChips type="project" />

      {/* Projects Grid/List */}
      {filteredAndSortedProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Không tìm thấy dự án</h3>
            <p className="text-muted-foreground text-center mt-1">Thử thay đổi bộ lọc hoặc tạo dự án mới</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedProjects.map((project, index) => {
            const stats = getProjectStats(project.id)
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
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
                      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{stats.progress}%</span>
                        </div>
                        <Progress value={stats.progress} className="h-2" />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 4).map((memberId) => {
                            const member = mockUsers.find((u) => u.id === memberId)
                            return member ? (
                              <Avatar key={memberId} className="h-7 w-7 border-2 border-background">
                                <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                              </Avatar>
                            ) : null
                          })}
                          {project.members.length > 4 && (
                            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                              <span className="text-xs">+{project.members.length - 4}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {stats.completed}/{stats.total} việc
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedProjects.map((project, index) => {
            const stats = getProjectStats(project.id)
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
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
                          <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 shrink-0">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Tiến độ</span>
                              <span>{stats.progress}%</span>
                            </div>
                            <Progress value={stats.progress} className="h-1.5" />
                          </div>
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
                          </div>
                          <span className="text-sm text-muted-foreground w-20 text-right">
                            {stats.completed}/{stats.total} việc
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel open={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} type="project" />
    </div>
  )
}
