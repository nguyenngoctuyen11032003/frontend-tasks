"use client"

/**
 * Filter Panel Component
 * Advanced filtering UI for tasks and projects
 */

import React, { useState } from "react"
import { X, Filter, Save, Download, Upload, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFilters } from "@/hooks/use-filters"
import { FilterManager, type TaskFilters, type ProjectFilters, type FilterPreset } from "@/lib/filters"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"
import type { TaskStatus, TaskPriority } from "@/types"

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  type: "task" | "project"
}

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Cần làm" },
  { value: "in_progress", label: "Đang làm" },
  { value: "review", label: "Đang xem xét" },
  { value: "done", label: "Hoàn thành" },
]

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Thấp", color: "text-gray-500" },
  { value: "medium", label: "Trung bình", color: "text-blue-500" },
  { value: "high", label: "Cao", color: "text-orange-500" },
  { value: "urgent", label: "Khẩn cấp", color: "text-red-500" },
]

const PROJECT_STATUSES: { value: "active" | "completed" | "archived" | "on-hold"; label: string }[] = [
  { value: "active", label: "Đang hoạt động" },
  { value: "completed", label: "Hoàn thành" },
  { value: "on-hold", label: "Tạm dừng" },
  { value: "archived", label: "Lưu trữ" },
]

export function FilterPanel({ open, onClose, type }: FilterPanelProps) {
  const {
    taskFilters,
    setTaskFilters,
    clearTaskFilters,
    projectFilters,
    setProjectFilters,
    clearProjectFilters,
    taskPresets,
    projectPresets,
    savePreset,
    deletePreset,
    applyPreset,
  } = useFilters()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null)
  const [presetName, setPresetName] = useState("")
  const [sectionsOpen, setSectionsOpen] = useState({
    presets: true,
    status: true,
    priority: true,
    date: false,
    progress: false,
  })

  const currentFilters = type === "task" ? taskFilters : projectFilters
  const presets = type === "task" ? taskPresets : projectPresets
  const hasActiveFilters = FilterManager.hasActiveFilters(currentFilters)

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleClearAll = () => {
    if (type === "task") {
      clearTaskFilters()
    } else {
      clearProjectFilters()
    }
    toast.success("Đã xóa tất cả bộ lọc")
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Vui lòng nhập tên bộ lọc")
      return
    }

    try {
      savePreset({
        name: presetName,
        type,
        filters: currentFilters,
        color: "gray",
      })
      toast.success("Đã lưu bộ lọc")
      setPresetName("")
      setSaveDialogOpen(false)
    } catch (error) {
      toast.error("Không thể lưu bộ lọc")
    }
  }

  const handleDeletePreset = () => {
    if (!presetToDelete) return

    const success = deletePreset(presetToDelete)
    if (success) {
      toast.success("Đã xóa bộ lọc")
    } else {
      toast.error("Không thể xóa bộ lọc")
    }
    setPresetToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleExportPresets = () => {
    const data = JSON.stringify(presets.filter((p) => !p.isDefault), null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `filter-presets-${type}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Đã xuất bộ lọc")
  }

  const handleImportPresets = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const presets = JSON.parse(e.target?.result as string) as FilterPreset[]
          presets.forEach((preset) => {
            if (preset.type === type) {
              savePreset({
                name: preset.name,
                type: preset.type,
                filters: preset.filters,
                icon: preset.icon,
                color: preset.color,
              })
            }
          })
          toast.success("Đã nhập bộ lọc")
        } catch (error) {
          toast.error("Không thể nhập bộ lọc")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Bộ lọc nâng cao</SheetTitle>
            <SheetDescription>
              Lọc {type === "task" ? "công việc" : "dự án"} theo nhiều tiêu chí
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-200px)] mt-6">
            <div className="space-y-6 pr-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!hasActiveFilters}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPresets}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất
                </Button>
                <Button variant="outline" size="sm" onClick={handleImportPresets}>
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearAll} className="ml-auto">
                    <X className="h-4 w-4 mr-2" />
                    Xóa tất cả
                  </Button>
                )}
              </div>

              <Separator />

              {/* Presets */}
              <Collapsible open={sectionsOpen.presets} onOpenChange={() => toggleSection("presets")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <Label className="text-base font-semibold">Bộ lọc có sẵn</Label>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${sectionsOpen.presets ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3">
                  {presets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có bộ lọc nào</p>
                  ) : (
                    presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer group"
                        onClick={() => applyPreset(preset)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{preset.name}</div>
                          {preset.isDefault && (
                            <Badge variant="secondary" className="mt-1">
                              Mặc định
                            </Badge>
                          )}
                        </div>
                        {!preset.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPresetToDelete(preset.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Task Filters */}
              {type === "task" && (
                <>
                  {/* Status Filter */}
                  <Collapsible open={sectionsOpen.status} onOpenChange={() => toggleSection("status")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <Label className="text-base font-semibold">Trạng thái</Label>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sectionsOpen.status ? "rotate-180" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-3">
                      {TASK_STATUSES.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={(taskFilters.status || []).includes(status.value)}
                            onCheckedChange={(checked) => {
                              const current = taskFilters.status || []
                              setTaskFilters({
                                ...taskFilters,
                                status: checked
                                  ? [...current, status.value]
                                  : current.filter((s) => s !== status.value),
                              })
                            }}
                          />
                          <label
                            htmlFor={`status-${status.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Priority Filter */}
                  <Collapsible open={sectionsOpen.priority} onOpenChange={() => toggleSection("priority")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <Label className="text-base font-semibold">Độ ưu tiên</Label>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sectionsOpen.priority ? "rotate-180" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-3">
                      {TASK_PRIORITIES.map((priority) => (
                        <div key={priority.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority.value}`}
                            checked={(taskFilters.priority || []).includes(priority.value)}
                            onCheckedChange={(checked) => {
                              const current = taskFilters.priority || []
                              setTaskFilters({
                                ...taskFilters,
                                priority: checked
                                  ? [...current, priority.value]
                                  : current.filter((p) => p !== priority.value),
                              })
                            }}
                          />
                          <label
                            htmlFor={`priority-${priority.value}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${priority.color}`}
                          >
                            {priority.label}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />
                </>
              )}

              {/* Project Filters */}
              {type === "project" && (
                <>
                  {/* Status Filter */}
                  <Collapsible open={sectionsOpen.status} onOpenChange={() => toggleSection("status")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <Label className="text-base font-semibold">Trạng thái</Label>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${sectionsOpen.status ? "rotate-180" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-3">
                      {PROJECT_STATUSES.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={(projectFilters.status || []).includes(status.value)}
                            onCheckedChange={(checked) => {
                              const current = projectFilters.status || []
                              setProjectFilters({
                                ...projectFilters,
                                status: checked
                                  ? [...current, status.value]
                                  : current.filter((s) => s !== status.value),
                              })
                            }}
                          />
                          <label
                            htmlFor={`status-${status.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />
                </>
              )}

              {/* Date Range Filter */}
              <Collapsible open={sectionsOpen.date} onOpenChange={() => toggleSection("date")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <Label className="text-base font-semibold">Thời gian</Label>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${sectionsOpen.date ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="space-y-2">
                    <Label>Từ ngày</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {currentFilters.dateRange?.start
                            ? format(currentFilters.dateRange.start, "PPP", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={currentFilters.dateRange?.start || undefined}
                          onSelect={(date) => {
                            if (type === "task") {
                              setTaskFilters({
                                ...taskFilters,
                                dateRange: {
                                  start: date || null,
                                  end: taskFilters.dateRange?.end || null,
                                },
                              })
                            } else {
                              setProjectFilters({
                                ...projectFilters,
                                dateRange: {
                                  start: date || null,
                                  end: projectFilters.dateRange?.end || null,
                                },
                              })
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Đến ngày</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {currentFilters.dateRange?.end
                            ? format(currentFilters.dateRange.end, "PPP", { locale: vi })
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={currentFilters.dateRange?.end || undefined}
                          onSelect={(date) => {
                            if (type === "task") {
                              setTaskFilters({
                                ...taskFilters,
                                dateRange: {
                                  start: taskFilters.dateRange?.start || null,
                                  end: date || null,
                                },
                              })
                            } else {
                              setProjectFilters({
                                ...projectFilters,
                                dateRange: {
                                  start: projectFilters.dateRange?.start || null,
                                  end: date || null,
                                },
                              })
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <Button className="w-full" onClick={onClose}>
              <Filter className="h-4 w-4 mr-2" />
              Áp dụng bộ lọc
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Save Preset Dialog */}
      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lưu bộ lọc</AlertDialogTitle>
            <AlertDialogDescription>
              Đặt tên cho bộ lọc này để sử dụng lại sau
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Tên bộ lọc"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePreset}>Lưu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Preset Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bộ lọc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bộ lọc này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePreset}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
