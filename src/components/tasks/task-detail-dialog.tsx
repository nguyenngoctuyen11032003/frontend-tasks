"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  User as UserIcon,
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
import type { Task, User } from "@/types"
import { toast } from "sonner"
import { RichEditor } from "@/components/editor/rich-editor"
import { useTasksStore } from "@/stores/tasks-store"
import { useAuthStore } from "@/stores/auth-store"
import { UsersService } from "@/services/users.service"
import { CommentsService } from "@/services/comments.service"
import { UploadService } from "@/services/upload.service"
import { ActivityLogsService } from "@/services/activity-logs.service"
import type { Comment, Attachment, ActivityLog } from "@/types"

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
  const [checklistItems, setChecklistItems] = useState(task?.checklistItems || [])
  const [tempChecklistItems, setTempChecklistItems] = useState(task?.checklistItems || [])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  const [editingChecklistText, setEditingChecklistText] = useState("")
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // Get stores
  const {
    selectedTask,
    fetchTask,
    updateTask,
    deleteTask,
    assignUsers,
    removeAssignee,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    addComment,
  } = useTasksStore()
  const { user: currentUser } = useAuthStore()

  // Fetch users, comments, attachments, and activity logs when dialog opens
  useEffect(() => {
    if (open && task) {
      fetchUsers()
      fetchComments()
      fetchAttachments()
      fetchActivityLogs()
    }
  }, [open, task?.id])

  // Auto scroll to bottom when comments change
  useEffect(() => {
    if (commentsContainerRef.current) {
      setTimeout(() => {
        const scrollHeight = commentsContainerRef.current?.scrollHeight || 0
        commentsContainerRef.current?.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        })
      }, 100)
    }
  }, [comments])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const result = await UsersService.getUsers({ limit: 100 })
      setAllUsers(result.data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchComments = async () => {
    if (!task) return
    setLoadingComments(true)
    try {
      const result = await CommentsService.getComments(task.id)
      setComments(result)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchAttachments = async () => {
    if (!task) return
    setLoadingAttachments(true)
    try {
      // Task already has attachments in the response, but we can fetch fresh if needed
      setAttachments(task.attachments || [])
    } catch (error) {
      console.error("Failed to fetch attachments:", error)
    } finally {
      setLoadingAttachments(false)
    }
  }

  const fetchActivityLogs = async () => {
    if (!task) return
    setLoadingActivityLogs(true)
    try {
      const logs = await ActivityLogsService.getTaskActivityLogs(task.id, 50)
      setActivityLogs(logs)
    } catch (error) {
      console.error("Failed to fetch activity logs:", error)
    } finally {
      setLoadingActivityLogs(false)
    }
  }

  // Fetch full task details when dialog opens
  useEffect(() => {
    if (open && task?.id) {
      fetchTask(task.id).catch((err) => {
        console.error("Failed to fetch task details:", err)
      })
    }
  }, [open, task?.id, fetchTask])

  // Update local state when task changes
  useEffect(() => {
    if (selectedTask && selectedTask.id === task?.id) {
      setDescriptionContent(selectedTask.description || "")
      setChecklistItems(selectedTask.checklistItems || [])
      setTempChecklistItems(selectedTask.checklistItems || [])
    }
  }, [selectedTask, task?.id])

  if (!task) return null

  const getInitials = (name?: string | null) => {
    if (!name) return "??"
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

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim() || !task) return
    
    try {
      await addChecklistItem(task.id, { title: newChecklistItem.trim() })
      setNewChecklistItem("")
      toast.success("Đã thêm mục checklist")
    } catch (error: any) {
      toast.error(error?.message || "Không thể thêm mục checklist")
    }
  }

  const handleToggleChecklistItem = async (id: string) => {
    if (!task) return
    const item = checklistItems.find(i => i.id === id)
    if (!item) return

    try {
      await updateChecklistItem(task.id, id, { completed: !item.completed })
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật mục checklist")
    }
  }

  const handleStartEditChecklistItem = (id: string, title: string) => {
    setEditingChecklistId(id)
    setEditingChecklistText(title)
  }

  const handleSaveEditChecklistItem = async () => {
    if (!editingChecklistText.trim() || !editingChecklistId || !task) return

    try {
      await updateChecklistItem(task.id, editingChecklistId, { title: editingChecklistText.trim() })
      setEditingChecklistId(null)
      setEditingChecklistText("")
      toast.success("Đã cập nhật mục checklist")
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật mục checklist")
    }
  }

  const handleDeleteChecklistItem = async (id: string) => {
    if (!task) return

    try {
      await removeChecklistItem(task.id, id)
      toast.success("Đã xóa mục checklist")
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa mục checklist")
    }
  }

  const handleSaveDescriptionAndChecklist = async () => {
    if (!task) return

    try {
      await updateTask(task.id, { description: descriptionContent })
      setIsEditingDescription(false)
      toast.success("Đã lưu mô tả")
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu mô tả")
    }
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

  const handleDelete = async () => {
    if (!task) return

    try {
      await deleteTask(task.id)
      setIsDeleteDialogOpen(false)
      onOpenChange(false)
      toast.success("Đã xóa công việc thành công")
      if (onDelete) onDelete(task.id)
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa công việc")
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
                      {task.project?.name || `Dự án #${task.projectId?.split("-")[1] || task.projectId}`}
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
                      users={allUsers}
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
                  )}
                  
                  {/* Save/Cancel Buttons for Description - Only in Edit Mode */}
                  {isEditingDescription && (
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
                  )}
                </div>

                <Separator />

                {/* Activity & Comments */}
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">Hoạt động</TabsTrigger>
                    <TabsTrigger value="comments">
                      Bình luận ({comments.length})
                    </TabsTrigger>
                    <TabsTrigger value="files">
                      <FileText className="h-4 w-4 mr-1" />
                      Files
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="activity" className="space-y-4">
                    {loadingActivityLogs ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Đang tải...
                      </div>
                    ) : activityLogs.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Chưa có hoạt động nào
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activityLogs.map((log) => (
                          <div key={log.id} className="flex gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={log.user?.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback>{getInitials(log.user?.name || "U")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">{log.user?.name}</span>{" "}
                                {ActivityLogsService.formatAction(log.action)}{" "}
                                {ActivityLogsService.formatEntityType(log.entityType)}
                                {log.metadata?.oldValue && log.metadata?.newValue && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    từ <span className="font-medium">{log.metadata.oldValue}</span> thành{" "}
                                    <span className="font-medium">{log.metadata.newValue}</span>
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="comments" className="space-y-4 h-[400px] flex flex-col">
                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* New Comment Form */}
                      <div className="flex gap-3 flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentUser?.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(currentUser?.name || "U")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Viết bình luận..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button 
                            onClick={async () => {
                              if (!comment.trim() || !task || !currentUser) return
                              try {
                                const newComment = await CommentsService.createComment(task.id, { content: comment.trim() })
                                // Update comments in real-time
                                setComments([...comments, newComment])
                                setComment("")
                                toast.success("Đã gửi bình luận thành công! 🎉")
                                // Refresh activity logs in background
                                fetchActivityLogs()
                              } catch (error: any) {
                                toast.error(error?.message || "Không thể gửi bình luận")
                              }
                            }}
                            disabled={!comment.trim()}
                          >
                            Gửi bình luận
                          </Button>
                        </div>
                      </div>

                      <Separator className="flex-shrink-0" />

                      {/* Comments List - Scrollable Container */}
                      <div 
                        ref={commentsContainerRef}
                        className="flex-1 overflow-y-auto space-y-4 pr-4"
                      >
                        {loadingComments ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Đang tải bình luận...
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Chưa có bình luận nào
                          </div>
                        ) : (
                          <div className="space-y-4">
                          {comments.map((c, index) => (
                            <motion.div 
                              key={c.id} 
                              className="flex gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent/70 transition-colors"
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              transition={{ 
                                duration: 0.4, 
                                delay: index * 0.05,
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                              }}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={c.author?.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback>{getInitials(c.author?.name || "U")}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{c.author?.name}</span>
                                  <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                                </div>
                                <p className="text-sm">{c.content}</p>
                                {currentUser?.id === c.author?.id && (
                                  <motion.div 
                                    className="flex gap-2 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 text-xs"
                                      onClick={() => {
                                        setDeleteCommentId(c.id)
                                        setIsDeleteCommentDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Xóa
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={commentsEndRef} />
                        </div>
                        )}
                      </div>
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
                        onUploadComplete={async (files) => {
                          if (!task) return
                          try {
                            await UploadService.uploadMultipleFiles(files, "task", task.id)
                            toast.success("Đã tải lên", {
                              description: `${files.length} file đã được đính kèm`,
                            })
                            // Refresh task to get updated attachments
                            await fetchTask(task.id)
                            fetchAttachments()
                          } catch (error: any) {
                            toast.error(error?.message || "Không thể tải file lên")
                          }
                        }}
                      />

                      {/* Attached Files */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Files đính kèm</h4>
                        {loadingAttachments ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            Đang tải...
                          </div>
                        ) : attachments && attachments.length > 0 ? (
                          attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                  <Paperclip className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "Unknown size"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const url = UploadService.getDownloadUrl(file.url)
                                    window.open(url, "_blank")
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive"
                                  onClick={async () => {
                                    const confirmed = window.confirm(`Xóa file ${file.name}?`)
                                    if (!confirmed) return
                                    try {
                                      await UploadService.deleteFile(file.id)
                                      toast.success("Đã xóa file")
                                      fetchAttachments()
                                    } catch (error: any) {
                                      toast.error(error?.message || "Không thể xóa file")
                                    }
                                  }}
                                >
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
                      <UserIcon className="h-4 w-4" />
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
                        disabled={loadingUsers}
                      />
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {loadingUsers ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              Đang tải...
                            </div>
                          ) : allUsers
                            .filter(u => 
                              u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
                              !task.assignees.some(a => a.id === u.id)
                            )
                            .map((user) => (
                              <button
                                key={user.id}
                                onClick={async () => {
                                  if (!task) return
                                  try {
                                    await assignUsers(task.id, [user.id])
                                    toast.success(`Đã thêm ${user.name}`)
                                    setIsAddingAssignee(false)
                                    setAssigneeSearch("")
                                  } catch (error: any) {
                                    toast.error(error?.message || `Không thể thêm ${user.name}`)
                                  }
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
                          {!loadingUsers && allUsers.filter(u => 
                            u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
                            !task.assignees.some(a => a.id === u.id)
                          ).length === 0 && (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              Không tìm thấy người dùng
                            </div>
                          )}
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
                          onClick={async () => {
                            if (!task) return
                            try {
                              await removeAssignee(task.id, assignee.id)
                              // Refresh task data after removing assignee
                              await fetchTask(task.id)
                              toast.success(`Đã xóa ${assignee.name}`)
                            } catch (error: any) {
                              toast.error(error?.message || `Không thể xóa ${assignee.name}`)
                            }
                          }}
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

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={isDeleteCommentDialogOpen} onOpenChange={setIsDeleteCommentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!task || !deleteCommentId) return
                try {
                  await CommentsService.deleteComment(task.id, deleteCommentId)
                  // Update comments in real-time
                  setComments(comments.filter(c => c.id !== deleteCommentId))
                  toast.success("Đã xóa bình luận! 🗑️")
                  setIsDeleteCommentDialogOpen(false)
                  setDeleteCommentId(null)
                  // Refresh activity logs in background
                  fetchActivityLogs()
                } catch (error: any) {
                  toast.error(error?.message || "Không thể xóa bình luận")
                }
              }}
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
