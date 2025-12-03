"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProjectsStore } from "@/stores/projects-store"
import type { CreateProjectPayload } from "@/services/projects.service"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROJECT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  const { createProject, fetchProjects } = useProjectsStore()

  const handleReset = useCallback(() => {
    setName("")
    setDescription("")
    setColor(PROJECT_COLORS[0])
    setStartDate("")
    setEndDate("")
  }, [])

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Lỗi", { description: "Vui lòng nhập tên dự án" })
      return
    }

    if (!description.trim()) {
      toast.error("Lỗi", { description: "Vui lòng nhập mô tả dự án" })
      return
    }

    try {
      setLoading(true)

      const payload: CreateProjectPayload = {
        name: name.trim(),
        description: description.trim(),
        color,
        status: "active",
      }

      if (startDate) payload.startDate = startDate
      if (endDate) payload.endDate = endDate

      await createProject(payload)

      // Refetch projects to get complete data with members, tags, etc.
      await fetchProjects()

      toast.success("Thành công", {
        description: `Dự án "${name}" đã được tạo thành công`,
      })

      // Reset and close
      handleReset()
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo dự án"
      toast.error("Lỗi", { description: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>Điền thông tin để tạo dự án mới</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="project-name">Tên dự án *</Label>
            <Input
              id="project-name"
              placeholder="Nhập tên dự án..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="project-description">Mô tả *</Label>
            <Textarea
              id="project-description"
              placeholder="Mô tả ngắn về dự án..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Ngày bắt đầu</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">Ngày kết thúc</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                min={startDate}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="grid gap-2">
            <Label>Màu sắc</Label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? "border-gray-400 ring-2 ring-offset-2 ring-gray-400" : "border-transparent hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  disabled={loading}
                  aria-label={`Chọn màu ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Đang tạo..." : "Tạo dự án"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
