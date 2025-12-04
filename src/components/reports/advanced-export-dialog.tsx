"use client"

import React, { useState } from "react"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ExportFormat, ReportType } from "@/services/reports.service"

interface ExportReportDialogProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onExport: (format: ExportFormat, filename: string, options?: ExportOptions) => Promise<void>
  isLoading?: boolean
  defaultReportType?: ReportType
  suggestedFilename?: string
}

interface ExportOptions {
  includeTimestamp: boolean
  includeSummary: boolean
  includeColors: boolean
  pageOrientation: "portrait" | "landscape"
}

/**
 * Advanced Export Report Dialog Component
 * Features:
 * - Multiple format selection (CSV, PDF, Excel)
 * - Filename customization
 * - Export options (colors, summary, timestamp)
 * - Format descriptions and previews
 * - Loading states and error handling
 */
export const AdvancedExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen: initialOpen,
  onOpenChange,
  onExport,
  isLoading = false,
  defaultReportType,
  suggestedFilename = "bao-cao",
}) => {
  const [open, setOpen] = useState(initialOpen ?? false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.CSV)
  const [filename, setFilename] = useState(suggestedFilename)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Export options
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamp: true,
    includeSummary: true,
    includeColors: true,
    pageOrientation: "portrait",
  })

  const formatDescriptions = {
    [ExportFormat.CSV]: {
      title: "CSV (Excel Compatible)",
      description: "Spreadsheet format compatible with Excel, Google Sheets, etc.",
      icon: FileSpreadsheet,
      color: "bg-green-100 text-green-700",
      badge: "✓ Recommended",
    },
    [ExportFormat.PDF]: {
      title: "PDF (Professional)",
      description: "Beautiful formatted PDF with tables, colors, and professional layout",
      icon: FileText,
      color: "bg-red-100 text-red-700",
      badge: "Professional",
    },
    [ExportFormat.EXCEL]: {
      title: "Excel (Multi-sheet)",
      description: "Advanced Excel format with multiple sheets and formatting",
      icon: FileSpreadsheet,
      color: "bg-blue-100 text-blue-700",
      badge: "Advanced",
    },
  }

  const handleExport = async () => {
    if (!filename.trim()) {
      toast.error("Vui lòng nhập tên file", {
        description: "Tên file không được để trống",
      })
      return
    }

    try {
      setIsExporting(true)

      // Call export with options
      await onExport(selectedFormat, filename, options)

      setExportSuccess(true)
      toast.success("Xuất file thành công!", {
        description: `File ${filename}.${selectedFormat === ExportFormat.CSV ? "csv" : selectedFormat === ExportFormat.PDF ? "pdf" : "xlsx"} đã được tải xuống`,
      })

      // Reset and close
      setTimeout(() => {
        setExportSuccess(false)
        setOpen(false)
        onOpenChange?.(false)
        setFilename(suggestedFilename)
      }, 1500)
    } catch (error: any) {
      toast.error("Lỗi khi xuất file", {
        description: error.message || "Vui lòng thử lại",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) {
      setExportSuccess(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Xuất Báo Cáo
          </DialogTitle>
          <DialogDescription>
            Chọn định dạng xuất và tùy chỉnh tùy chọn để tạo báo cáo hoàn hảo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Chọn Định Dạng</Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(formatDescriptions).map(([format, info]) => {
                const Icon = info.icon
                const isSelected = selectedFormat === format

                return (
                  <Card
                    key={format}
                    className={`cursor-pointer p-4 transition-all ${
                      isSelected
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedFormat(format as ExportFormat)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`rounded-lg p-3 ${info.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-center text-sm font-medium">{info.title}</p>
                      <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium">
                        {info.badge}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">
              {formatDescriptions[selectedFormat].description}
            </p>
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-semibold">
              Tên File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="filename"
                placeholder="nhập tên file"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isExporting}
                className="flex-1"
              />
              <span className="text-xs text-gray-500">
                .{selectedFormat === ExportFormat.CSV ? "csv" : selectedFormat === ExportFormat.PDF ? "pdf" : "xlsx"}
              </span>
            </div>
          </div>

          {/* Export Options */}
          <Card className="space-y-4 border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-gray-600" />
              <p className="text-sm font-semibold">Tùy Chọn Xuất</p>
            </div>

            <div className="space-y-3">
              {/* Timestamp */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={options.includeTimestamp}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeTimestamp: checked as boolean })
                    }
                    disabled={isExporting}
                  />
                  <span>Bao gồm dấu thời gian</span>
                </label>
                <span className="text-xs text-gray-500">
                  {options.includeTimestamp ? "✓" : "✗"}
                </span>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={options.includeSummary}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeSummary: checked as boolean })
                    }
                    disabled={isExporting}
                  />
                  <span>Bao gồm tóm tắt thống kê</span>
                </label>
                <span className="text-xs text-gray-500">
                  {options.includeSummary ? "✓" : "✗"}
                </span>
              </div>

              {/* Colors (for PDF/Excel) */}
              {selectedFormat !== ExportFormat.CSV && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={options.includeColors}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, includeColors: checked as boolean })
                      }
                      disabled={isExporting}
                    />
                    <span>Bao gồm màu sắc & định dạng</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {options.includeColors ? "✓" : "✗"}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Success Message */}
          {exportSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <Check className="h-5 w-5" />
              <span>Xuất file thành công!</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isExporting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Xuất Ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedExportReportDialog
