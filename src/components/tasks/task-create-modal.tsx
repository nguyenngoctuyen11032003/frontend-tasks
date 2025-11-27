"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Plus, X } from "lucide-react"
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
import { cn, formatDate } from "@/lib/utils"
import { mockUsers, mockProjects, mockTags } from "@/mocks/data"
import type { TaskStatus, TaskPriority } from "@/types"
import { toast } from "sonner"

interface TaskCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStatus?: TaskStatus
  onSuccess?: () => void
  editTask?: any // Task to edit if in edit mode
  mode?: "create" | "edit"
}

export function TaskCreateModal({ open, onOpenChange, defaultStatus = "todo", onSuccess, editTask, mode = "create" }: TaskCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(editTask?.title || "")
  const [description, setDescription] = useState(editTask?.description || "")
  const [status, setStatus] = useState<TaskStatus>(editTask?.status || defaultStatus)
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || "medium")
  const [projectId, setProjectId] = useState(editTask?.projectId || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(editTask?.dueDate ? new Date(editTask.dueDate) : undefined)
  const [estimatedHours, setEstimatedHours] = useState(editTask?.estimatedHours?.toString() || "")
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(editTask?.assignees || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(editTask?.tags || [])

  // Sync form with editTask when it changes
  useEffect(() => {
    if (editTask && mode === "edit") {
      setTitle(editTask.title || "")
      setDescription(editTask.description || "")
      setStatus(editTask.status || defaultStatus)
      setPriority(editTask.priority || "medium")
      setProjectId(editTask.projectId || "")
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate) : undefined)
      setEstimatedHours(editTask.estimatedHours?.toString() || "")
      setSelectedAssignees(editTask.assignees || [])
      setSelectedTags(editTask.tags || [])
    }
  }, [editTask, mode, defaultStatus])

  const getInitials = (name: string) => {
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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc")
      return
    }
    if (!projectId) {
      toast.error("Vui lòng chọn dự án")
      return
    }

    setIsLoading(true)
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (mode === "edit") {
        toast.success("Đã cập nhật công việc")
      } else {
        toast.success("Đã tạo công việc mới")
      }
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(mode === "edit" ? "Có lỗi xảy ra khi cập nhật công việc" : "Có lỗi xảy ra khi tạo công việc")
    } finally {
      setIsLoading(false)
    }
  }

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
                  {mockProjects.map((project) => (
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
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
              {selectedAssignees.map((userId) => {
                const user = mockUsers.find((u) => u.id === userId)
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
                    {mockUsers
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
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Nhãn</Label>
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    borderColor: tag.color,
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : "transparent",
                    color: selectedTags.includes(tag.id) ? "white" : tag.color,
                  }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
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
