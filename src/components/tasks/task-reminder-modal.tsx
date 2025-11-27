"use client"

import { useState } from "react"
import { Bell, Calendar, Plus, X, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import type { Task, TaskReminder } from "@/types"

interface TaskReminderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
}

export function TaskReminderModal({ open, onOpenChange, task }: TaskReminderModalProps) {
  const [reminders, setReminders] = useState<TaskReminder[]>(task.reminders || [])
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderMessage, setReminderMessage] = useState("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAddReminder = () => {
    if (!reminderDate || !reminderMessage.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin nhắc nhở")
      return
    }

    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}:00`)
    if (reminderDateTime <= new Date()) {
      toast.error("Thời gian nhắc nhở phải là thời điểm trong tương lai")
      return
    }

    const newReminder: TaskReminder = {
      id: `reminder-${Date.now()}`,
      taskId: task.id,
      reminderDate: reminderDateTime.toISOString(),
      message: reminderMessage,
      isActive: true,
      createdBy: task.assignedBy || task.assignees[0],
      createdAt: new Date().toISOString(),
    }

    setReminders([...reminders, newReminder])
    setReminderDate("")
    setReminderTime("09:00")
    setReminderMessage("")
    toast.success("Đã thêm lời nhắc thành công")
  }

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(reminders.filter((r) => r.id !== reminderId))
    toast.success("Đã xóa lời nhắc")
  }

  const handleSave = () => {
    // In real app, save to backend
    toast.success("Đã lưu các lời nhắc")
    onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quản lý nhắc việc
          </DialogTitle>
          <DialogDescription>
            Tạo lời nhắc cho công việc <span className="font-medium">"{task.title}"</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Task Info */}
            {task.assignedBy && (
              <div className="p-3 rounded-lg border bg-accent/50">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Người giao việc:</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedBy.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{getInitials(task.assignedBy.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{task.assignedBy.name}</span>
                </div>
              </div>
            )}

            {/* Add Reminder Form */}
            <div className="space-y-4 p-4 rounded-lg border-2 border-dashed bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm lời nhắc mới
              </h4>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Ngày
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Giờ
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">
                    Nội dung nhắc nhở
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="VD: Nhắc nhở: Deadline còn 2 ngày..."
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button onClick={handleAddReminder} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm lời nhắc
                </Button>
              </div>
            </div>

            {/* Existing Reminders */}
            {reminders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Các lời nhắc đã tạo</h4>
                  <Badge variant="secondary">{reminders.length}</Badge>
                </div>
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-4 rounded-lg border-2 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                              {formatDateTime(reminder.reminderDate)}
                            </p>
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            {reminder.message}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <Avatar className="h-5 w-5 border">
                              <AvatarImage src={reminder.createdBy.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {getInitials(reminder.createdBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-amber-700 dark:text-amber-300">
                              Bởi {reminder.createdBy.name}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:bg-red-100 dark:hover:bg-red-950"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reminders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Bell className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">Chưa có lời nhắc nào</p>
                <p className="text-sm mt-1">Thêm lời nhắc để không bỏ lỡ deadline</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
