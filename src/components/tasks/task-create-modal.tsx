"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TagsInput } from "@/components/notes/tags-input"
import { cn, formatDate } from "@/lib/utils"
import type { TaskStatus, TaskPriority, Task, User, Tag } from "@/types"
import { toast } from "sonner"
import { useTasksStore } from "@/stores/tasks-store"
import { useProjectsStore } from "@/stores/projects-store"
import { useAuthStore } from "@/stores/auth-store"
import { useTagsStore } from "@/stores/tags-store"
import { tasksService } from "@/services/tasks.service"
import { UsersService } from "@/services/users.service"

interface TaskCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus?: TaskStatus
  onSuccess?: () => void
  editTask?: Task | null // Task to edit if in edit mode
  mode?: "create" | "edit"
  defaultProjectId?: string // Default project ID for creating task from project detail page
}

export function TaskCreateModal({ open, onOpenChange, defaultStatus = "todo", onSuccess, editTask, mode = "create", defaultProjectId }: TaskCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [projectId, setProjectId] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [estimatedHours, setEstimatedHours] = useState("")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  // Data from services
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Get stores
  const { createTask, updateTask } = useTasksStore()
  const { projects } = useProjectsStore()
  const { user: currentUser } = useAuthStore()
  const allTags = useTagsStore(state => state.tags)
  const fetchTags = useTagsStore(state => state.fetchTags)
  const loadingTags = useTagsStore(state => state.loading)

  // Fetch users and tags when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers()
      fetchTags().catch(err => console.error('Failed to fetch tags:', err))
    }
  }, [open, fetchTags])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const result = await UsersService.getUsers({ limit: 100 })
      setAllUsers(result.data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Không thể tải danh sách người dùng")
    } finally {
      setLoadingUsers(false)
    }
  }

  // Sync form with editTask when it changes
  useEffect(() => {
    if (editTask && mode === "edit" && open) {
      setTitle(editTask.title || "")
      setDescription(editTask.description || "")
      setStatus(editTask.status || defaultStatus)
      setPriority(editTask.priority || "medium")
      setProjectId(editTask.projectId || "")
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate) : undefined)
      setEstimatedHours(editTask.estimatedHours?.toString() || "")
      setSelectedAssignees(editTask.assignees?.map((a) => a.id) || [])
      setSelectedTags(editTask.tags || [])
    } else if (mode === "create" && open) {
      resetForm()
      // Set default project if provided
      if (defaultProjectId) {
        setProjectId(defaultProjectId)
      }
    }
  }, [editTask, mode, defaultStatus, open, defaultProjectId])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStatus(defaultStatus)
    setPriority("medium")
    setProjectId("")
    setDueDate(undefined)
    setEstimatedHours("")
    setSelectedAssignees([])
    setSelectedTags([])
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  // Helper functions for task operations
  const assignUsers = async (taskId: string, userIds: string[]) => {
    return tasksService.assignUsers(taskId, userIds)
  }

  const removeAssignee = async (taskId: string, assigneeId: string) => {
    return tasksService.removeAssignee(taskId, assigneeId)
  }

  const addTagsToTask = async (taskId: string, tagIds: string[]) => {
    return tasksService.addTags(taskId, tagIds)
  }

  const removeTagFromTask = async (taskId: string, tagId: string) => {
    return tasksService.removeTag(taskId, tagId)
  }

  const handleSubmit = async () => {
    // Validation
    if (!title.trim() || title.trim().length < 2) {
      toast.error("Vui lòng nhập tiêu đề công việc (tối thiểu 2 ký tự)")
      return
    }
    if (!projectId) {
      toast.error("Vui lòng chọn dự án")
      return
    }

    setIsLoading(true)
    try {
      if (mode === "edit" && editTask) {
        // Update existing task
        const updateData: any = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          dueDate: dueDate?.toISOString() || undefined,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          projectId,
        }

        await updateTask(editTask.id, updateData)
        
        // Handle assignees separately
        if (selectedAssignees && selectedAssignees.length > 0) {
          try {
            const currentAssigneeIds = (editTask.assignees || []).map(a => a.id)
            // Remove assignees that are no longer selected
            for (const id of currentAssigneeIds) {
              if (!selectedAssignees.includes(id)) {
                await removeAssignee(editTask.id, id)
              }
            }
            // Add new assignees
            const newAssignees = selectedAssignees.filter(id => !currentAssigneeIds.includes(id))
            if (newAssignees.length > 0) {
              await assignUsers(editTask.id, newAssignees)
            }
          } catch (error) {
            console.error("Failed to update assignees:", error)
            toast.warning("Không thể cập nhật tất cả người được giao việc")
          }
        }
        
        // Handle tags separately
        const newTagIds = selectedTags
          .map(tag => tag.id)
          .filter(id => id && id.trim().length > 0)
        
        if (newTagIds.length > 0 || (editTask.tags && editTask.tags.length > 0)) {
          try {
            const currentTagIds = (editTask.tags || [])
              .map(tag => typeof tag === 'string' ? tag : tag.id)
              .filter(Boolean) as string[]
            
            // Remove tags that are no longer selected
            for (const id of currentTagIds) {
              if (!newTagIds.includes(id)) {
                await removeTagFromTask(editTask.id, id)
              }
            }
            
            // Add new tags
            const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id))
            if (tagsToAdd.length > 0) {
              await addTagsToTask(editTask.id, tagsToAdd)
            }
          } catch (error) {
            console.error("Failed to update tags:", error)
            toast.warning("Không thể cập nhật tất cả tags")
          }
        }
        
        toast.success("Đã cập nhật công việc")
      } else {
        // Create new task
        if (!currentUser) {
          toast.error("Bạn cần đăng nhập để tạo công việc")
          return
        }

        const taskData: any = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          dueDate: dueDate?.toISOString() || undefined,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          projectId,
          assignedById: currentUser.id,
        }

        const createdTask = await createTask(taskData)
        
        // Add assignees after task is created
        if (selectedAssignees && selectedAssignees.length > 0) {
          try {
            await assignUsers(createdTask.id, selectedAssignees)
          } catch (error) {
            console.error("Failed to assign users:", error)
            toast.warning("Công việc đã tạo nhưng không thể giao cho tất cả người dùng")
          }
        }
        
        // Add tags after task is created
        const tagIds = selectedTags
          .map(tag => tag.id)
          .filter(id => id && id.trim().length > 0)
        
        if (tagIds.length > 0) {
          try {
            await addTagsToTask(createdTask.id, tagIds)
          } catch (error) {
            console.error("Failed to add tags:", error)
            toast.warning("Công việc đã tạo nhưng không thể thêm tất cả tags")
          }
        }
        
        toast.success("Đã tạo công việc mới")
      }
      
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 
        (mode === "edit" ? "Có lỗi xảy ra khi cập nhật công việc" : "Có lỗi xảy ra khi tạo công việc")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Chỉnh sửa công việc" : "Tạo công việc mới"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Cập nhật thông tin công việc" : "Điền thông tin để tạo công việc mới cho dự án"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề công việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết công việc..."
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Project & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Dự án <span className="text-destructive">*</span>
              </Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn dự án" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Chờ xử lý</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="review">Đang review</SelectItem>
                  <SelectItem value="done">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Độ ưu tiên</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hạn hoàn thành</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatDate(dueDate) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label htmlFor="hours">Thời gian ước tính (giờ)</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              placeholder="VD: 8"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label>Người thực hiện</Label>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-3 border rounded-lg min-h-[60px]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                {selectedAssignees.map((userId) => {
                  const user = allUsers.find((u) => u.id === userId)
                  if (!user) return null
                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1 pr-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={() => toggleAssignee(userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 bg-transparent">
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      {allUsers
                        .filter((u) => !selectedAssignees.includes(u.id))
                        .map((user) => (
                          <button
                            key={user.id}
                          onClick={() => toggleAssignee(user.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent text-left"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Nhãn</Label>
            {loadingTags ? (
              <div className="flex items-center justify-center p-3 border rounded-lg min-h-[60px]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
              </div>
            ) : (
              <TagsInput
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                placeholder="Chọn hoặc thêm nhãn..."
                maxTags={10}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (mode === "edit" ? "Đang cập nhật..." : "Đang tạo...") : (mode === "edit" ? "Cập nhật" : "Tạo công việc")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
