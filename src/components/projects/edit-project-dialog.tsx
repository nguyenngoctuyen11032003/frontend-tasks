"use client"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useProjectsStore } from "@/stores/projects-store"
import { toast } from "sonner"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

const COLOR_OPTIONS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function EditProjectDialog({ open, onOpenChange, projectId }: EditProjectDialogProps) {
  const { selectedProject, updateLoading, getProject, updateProject } = useProjectsStore()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    startDate: "",
    endDate: "",
  })

  // Load project data when dialog opens or projectId changes
  useEffect(() => {
    if (open && projectId) {
      const project = getProject(projectId)
      if (project) {
        setFormData({
          name: project.name || "",
          description: project.description || "",
          color: project.color || "#3b82f6",
          startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
          endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        })
      }
    }
  }, [open, projectId, getProject])

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Tên dự án không được trống")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("Mô tả không được trống")
      return false
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        toast.error("Ngày kết thúc phải sau ngày bắt đầu")
        return false
      }
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return
    if (!projectId) return

    try {
      await updateProject(projectId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      })

      toast.success(`Cập nhật dự án "${formData.name}" thành công`)
      onOpenChange(false)
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        startDate: "",
        endDate: "",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi cập nhật dự án"
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa dự án</DialogTitle>
          <DialogDescription>Cập nhật thông tin dự án của bạn</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Tên dự án</Label>
            <Input
              id="edit-name"
              placeholder="Nhập tên dự án..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={updateLoading}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Mô tả</Label>
            <Textarea
              id="edit-description"
              placeholder="Mô tả ngắn về dự án..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={updateLoading}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-startDate">Ngày bắt đầu</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={updateLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-endDate">Ngày kết thúc</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={updateLoading}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="grid gap-2">
            <Label>Màu sắc</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-8 w-8 rounded-full border-2 transition-colors ${
                    formData.color === color ? "border-gray-700" : "border-transparent hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={updateLoading}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateLoading}
            className="flex items-center gap-2"
          >
            {updateLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {updateLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
