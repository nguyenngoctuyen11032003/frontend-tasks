"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  Tag,
  CheckSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Bell,
  UserCheck,
  FileText,
  Upload,
  Download,
  UserPlus,
  UserMinus,
  Plus,
  Save,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { PriorityBadge } from "@/components/ui/status-badge"
import { TaskReminderModal } from "@/components/tasks/task-reminder-modal"
import { FileUploadDialog } from "@/components/upload"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"
import { mockUsers } from "@/mocks/data"
import { toast } from "sonner"
import { RichEditor } from "@/components/editor/rich-editor"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskDetailDialog({ task, open, onOpenChange, onEdit, onDelete }: TaskDetailDialogProps) {
  const [comment, setComment] = useState("")
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isAddingAssignee, setIsAddingAssignee] = useState(false)
  const [assigneeSearch, setAssigneeSearch] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(task?.description || "")
  const [checklistItems, setChecklistItems] = useState(task?.checklist || [])
  const [tempChecklistItems, setTempChecklistItems] = useState(task?.checklist || [])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const [editingChecklistText, setEditingChecklistText] = useState("")

  if (!task) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const displayChecklist = isEditingDescription ? tempChecklistItems : checklistItems
  const completedChecklist = displayChecklist.filter((item) => item.completed).length
  const totalChecklist = displayChecklist.length
  const checklistProgress = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const newItem = {
      id: `checklist-${Date.now()}`,
      title: newChecklistItem,
      completed: false
    }
    setTempChecklistItems([...tempChecklistItems, newItem])
    setNewChecklistItem("")
  }

  const handleToggleChecklistItem = (id: string) => {
    if (isEditingDescription) {
      setTempChecklistItems(tempChecklistItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ))
    }
  }

  const handleStartEditChecklistItem = (id: string, title: string) => {
    setEditingChecklistId(id)
    setEditingChecklistText(title)
  }

  const handleSaveEditChecklistItem = () => {
    if (!editingChecklistText.trim() || !editingChecklistId) return
    setTempChecklistItems(tempChecklistItems.map(item =>
      item.id === editingChecklistId ? { ...item, title: editingChecklistText } : item
    ))
    setEditingChecklistId(null)
    setEditingChecklistText("")
  }

  const handleDeleteChecklistItem = (id: string) => {
    setTempChecklistItems(tempChecklistItems.filter(item => item.id !== id))
  }

  const handleSaveDescriptionAndChecklist = () => {
    // Save both description and checklist
    setChecklistItems(tempChecklistItems)
    setIsEditingDescription(false)
    toast.success("Đã lưu mô tả và checklist")
  }

  const handleCancelEdit = () => {
    setDescriptionContent(task.description)
    setTempChecklistItems(checklistItems)
    setIsEditingDescription(false)
    setNewChecklistItem("")
    setEditingChecklistId(null)
  }

  const handleStartEdit = () => {
    setIsEditingDescription(true)
    setTempChecklistItems([...checklistItems])
  }

  const handleEdit = () => {
    if (onEdit && task) {
      onEdit(task)
      toast.success("Đang mở form chỉnh sửa...")
    }
  }

  const handleDelete = () => {
    if (onDelete && task) {
      onDelete(task.id)
      setIsDeleteDialogOpen(false)
      onOpenChange(false)
      toast.success("Đã xóa công việc thành công")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl pr-8">{task.title}</DialogTitle>
                  <DialogDescription className="mt-2">
                    Trong dự án{" "}
                    <span className="font-medium">
                      {/* Project name would come from project lookup */}
                      Dự án #{task.projectId.split("-")[1]}
                    </span>
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Mô tả
                    </h3>
                    {!isEditingDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEdit}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <RichEditor
                      content={descriptionContent}
                      onChange={setDescriptionContent}
                      placeholder="Nhập mô tả công việc..."
                      users={mockUsers}
                    />
                  ) : (
                    <div 
                      className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: task.description }}
                    />
                  )}
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Checklist
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {completedChecklist}/{totalChecklist}
                    </span>
                  </div>
                  {totalChecklist > 0 && (
                    <Progress value={checklistProgress} className="h-2 mb-3" />
                  )}
                  <div className="space-y-2 mb-3">
                    {displayChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="h-4 w-4 rounded cursor-pointer"
                          disabled={!isEditingDescription}
                        />
                        {isEditingDescription && editingChecklistId === item.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editingChecklistText}
                              onChange={(e) => setEditingChecklistText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditChecklistItem()
                                if (e.key === 'Escape') {
                                  setEditingChecklistId(null)
                                  setEditingChecklistText("")
                                }
                              }}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveEditChecklistItem}>
                              Lưu
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setEditingChecklistId(null)
                              setEditingChecklistText("")
                            }}>
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className={cn("text-sm flex-1", item.completed && "line-through text-muted-foreground")}>
                              {item.title}
                            </span>
                            {isEditingDescription && (
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => handleStartEditChecklistItem(item.id, item.title)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteChecklistItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Add New Checklist Item - Only in Edit Mode */}
                  {isEditingDescription && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Thêm mục mới..."
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddChecklistItem()
                          }}
                          className="h-9 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddChecklistItem}
                          disabled={!newChecklistItem.trim()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm
                        </Button>
                      </div>
                      
                      {/* Save/Cancel Buttons for Description + Checklist */}
                      <div className="flex gap-2 justify-end pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveDescriptionAndChecklist}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Lưu thay đổi
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Activity & Comments */}
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                    <TabsTrigger value="comments">
                      Bình luận ({task.commentsCount})
                    </TabsTrigger>
                    <TabsTrigger value="files">
                      <FileText className="h-4 w-4 mr-1" />
                      Files
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="activity" className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { action: "đã tạo công việc", time: task.createdAt },
                        { action: "đã cập nhật trạng thái", time: task.updatedAt },
                      ].map((activity, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="mt-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{task.assignees[0]?.name || "Người dùng"}</span>{" "}
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(activity.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="comments" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task.assignees[0]?.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(task.assignees[0]?.name || "U")}</AvatarFallback>
                        </Avatar>
                        <Textarea
                          placeholder="Viết bình luận..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <Button>Gửi bình luận</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    <div className="space-y-4">
                      {/* File Upload Dialog */}
                      <FileUploadDialog
                        trigger={
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">Tải file lên</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kéo thả file hoặc click để chọn
                            </p>
                          </div>
                        }
                        title="Đính kèm file vào task"
                        description="Tải lên tài liệu, hình ảnh hoặc file liên quan"
                        maxSize={10}
                        maxFiles={5}
                        onUploadComplete={(files) => {
                          toast.success("Đã tải lên", {
                            description: `${files.length} file đã được đính kèm`,
                          })
                        }}
                      />

                      {/* Attached Files */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Files đính kèm</h4>
                        {task.attachments && task.attachments.length > 0 ? (
                          task.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                  <Paperclip className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{file.size}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Chưa có file đính kèm
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Trạng thái</h4>
                  <Badge
                    variant={
                      task.status === "done"
                        ? "default"
                        : task.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {task.status === "todo"
                      ? "Chờ làm"
                      : task.status === "in_progress"
                        ? "Đang làm"
                        : task.status === "review"
                          ? "Review"
                          : "Hoàn thành"}
                  </Badge>
                </div>

                {/* Priority */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Độ ưu tiên</h4>
                  <PriorityBadge priority={task.priority} />
                </div>

                {/* Assignees */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Người thực hiện
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => setIsAddingAssignee(!isAddingAssignee)}
                    >
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </div>

                  {isAddingAssignee && (
                    <div className="mb-3 p-2 border rounded-lg space-y-2">
                      <Input 
                        placeholder="Tìm kiếm người dùng..."
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                        className="h-8"
                      />
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {mockUsers
                            .filter(u => 
                              u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
                              !task.assignees.some(a => a.id === u.id)
                            )
                            .map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  toast.success(`Đã thêm ${user.name}`)
                                  setIsAddingAssignee(false)
                                  setAssigneeSearch("")
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                              </button>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="space-y-2">
                    {task.assignees.map((assignee) => (
                      <div key={assignee.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={assignee.avatarUrl || "/placeholder.svg"} />
                            <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{assignee.name}</p>
                            <p className="text-xs text-muted-foreground">{assignee.role}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => toast.success(`Đã xóa ${assignee.name}`)}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {task.assignedBy && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Giao bởi</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignedBy.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{getInitials(task.assignedBy.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignedBy.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thời gian
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hạn chót:</span>
                      <span className="font-medium">{formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạo lúc:</span>
                      <span>{formatDate(task.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cập nhật:</span>
                      <span>{formatDate(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Hours */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Thời gian ước tính
                  </h4>
                  <p className="text-sm">{task.estimatedHours} giờ</p>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          style={{
                            borderColor: tag.color,
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reminders */}
                {task.reminders && task.reminders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Nhắc nhở ({task.reminders.filter((r) => r.isActive).length})
                    </h4>
                    <div className="space-y-2">
                      {task.reminders
                        .filter((reminder) => reminder.isActive)
                        .map((reminder) => (
                          <div
                            key={reminder.id}
                            className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          >
                            <div className="flex items-start gap-2">
                              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                  {reminder.message}
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                  Nhắc lúc: {formatDateTime(reminder.reminderDate)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Bởi: {reminder.createdBy.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {task.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Tệp đính kèm ({task.attachments.length})
                    </h4>
                    <div className="space-y-1">
                      {task.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 cursor-pointer"
                        >
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsReminderModalOpen(true)}>
                    <Bell className="mr-2 h-4 w-4" />
                    Quản lý nhắc việc
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa công việc
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive hover:bg-destructive/10" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa công việc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
      
      {/* Reminder Modal */}
      {task && (
        <TaskReminderModal
          open={isReminderModalOpen}
          onOpenChange={setIsReminderModalOpen}
          task={task}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa công việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa công việc "{task?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
