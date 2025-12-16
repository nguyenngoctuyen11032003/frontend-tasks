"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, FileSpreadsheet, FileJson, FileText, Printer, Calendar, Users } from "lucide-react"
import { exportToCSV, exportToJSON, printContent, generateFilename } from "@/lib/export-utils"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: any[]
  availableFields: Array<{ key: string; label: string }>
  title?: string
  defaultFilename?: string
  onExport?: (format: string, fields: string[]) => void
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  availableFields,
  title = "Xuất dữ liệu",
  defaultFilename = "export",
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json" | "excel" | "pdf">("csv")
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.map((f) => f.key)
  )
  const [filename, setFilename] = useState(defaultFilename)
  const [isExporting, setIsExporting] = useState(false)
  
  // Advanced filters
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [dateField, setDateField] = useState<string>("createdAt")

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }

  const handleSelectAll = () => {
    setSelectedFields(availableFields.map((f) => f.key))
  }

  const handleDeselectAll = () => {
    setSelectedFields([])
  }

  // Filter data based on advanced options
  const getFilteredData = () => {
    let filtered = [...data]

    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item[dateField] || item.createdAt || item.dueDate)
        if (dateFrom && new Date(dateFrom) > itemDate) return false
        if (dateTo && new Date(dateTo) < itemDate) return false
        return true
      })
    }

    // Filter by user
    if (selectedUser !== "all") {
      filtered = filtered.filter((item) => {
        if (item.assigneeId === selectedUser) return true
        if (item.assignees?.some((a: any) => a.id === selectedUser)) return true
        if (item.createdBy === selectedUser) return true
        return false
      })
    }

    return filtered
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("Lỗi", {
        description: "Vui lòng chọn ít nhất một trường để xuất",
      })
      return
    }

    setIsExporting(true)

    try {
      // Get filtered data
      const filteredByOptions = getFilteredData()
      
      // Filter data to only include selected fields
      const filteredData = filteredByOptions.map((item) => {
        const filtered: any = {}
        selectedFields.forEach((field) => {
          const fieldConfig = availableFields.find((f) => f.key === field)
          filtered[fieldConfig?.label || field] = item[field]
        })
        return filtered
      })

      // Generate filename with extension
      const fullFilename = generateFilename(filename, format === "excel" ? "xls" : format)

      switch (format) {
        case "csv":
          exportToCSV(filteredData, filename)
          break
        case "json":
          exportToJSON(filteredData, filename)
          break
        case "excel":
          // For Excel, we'll use CSV format with .xls extension
          exportToCSV(filteredData, filename)
          break
        case "pdf":
          toast.info("Chức năng xuất PDF", {
            description: "Sử dụng Ctrl/Cmd+P để in và lưu thành PDF",
          })
          break
      }

      toast.success("Xuất thành công", {
        description: `Đã xuất ${filteredData.length} bản ghi sang ${format.toUpperCase()}`,
      })

      if (onExport) {
        onExport(format, selectedFields)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Lỗi xuất dữ liệu", {
        description: "Có lỗi xảy ra khi xuất dữ liệu",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const filteredCount = getFilteredData().length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Chọn định dạng, bộ lọc và các trường muốn xuất
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 py-4 pr-4">
            {/* Advanced Filters Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">Bộ lọc nâng cao</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-sm">Từ ngày</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-sm">Đến ngày</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date Field Selection */}
                <div className="space-y-2">
                  <Label htmlFor="dateField" className="text-sm">Lọc theo trường</Label>
                  <Select value={dateField} onValueChange={setDateField}>
                    <SelectTrigger id="dateField">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Ngày tạo</SelectItem>
                      <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                      <SelectItem value="dueDate">Hạn hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Filter */}
                <div className="space-y-2">
                  <Label htmlFor="userFilter" className="text-sm flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Người thực hiện
                  </Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id="userFilter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả mọi người</SelectItem>
                      {/* Users will be fetched from API/Store */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(dateFrom || dateTo || selectedUser !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("")
                    setDateTo("")
                    setSelectedUser("all")
                  }}
                  className="w-full"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label>Định dạng xuất</Label>
              <RadioGroup value={format} onValueChange={(v: any) => setFormat(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2 font-normal cursor-pointer">
                    <FileText className="h-4 w-4 text-green-600" />
                    CSV - Comma Separated Values
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2 font-normal cursor-pointer">
                    <FileJson className="h-4 w-4 text-blue-600" />
                    JSON - JavaScript Object Notation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2 font-normal cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    Excel - Microsoft Excel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Printer className="h-4 w-4 text-red-600" />
                    PDF - In và lưu thành PDF
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Filename Input */}
            <div className="space-y-2">
              <Label htmlFor="filename">Tên file</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Nhập tên file"
              />
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Chọn trường xuất ({selectedFields.length}/{availableFields.length})</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    Chọn tất cả
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto p-4 border rounded-lg">
                {availableFields.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={() => handleFieldToggle(field.key)}
                    />
                    <Label
                      htmlFor={field.key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                Tổng dữ liệu: <strong className="text-foreground">{data.length}</strong> bản ghi
              </p>
              <p className="text-muted-foreground">
                Sau khi lọc: <strong className="text-foreground">{filteredCount}</strong> bản ghi
              </p>
              <p className="text-muted-foreground">
                Số trường xuất: <strong className="text-foreground">{selectedFields.length}</strong> trường
              </p>
              <p className="text-muted-foreground">
                Định dạng: <strong className="text-foreground">{format.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? "Đang xuất..." : `Xuất ${filteredCount} bản ghi`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
