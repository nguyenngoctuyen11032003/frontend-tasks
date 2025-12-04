import React, { useState } from "react"
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { ExportFormat, ReportType } from "@/services/reports.service"

interface ExportReportDialogProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onExport: (format: ExportFormat, filename: string) => Promise<void>
  isLoading?: boolean
  defaultReportType?: ReportType
  suggestedFilename?: string
}

/**
 * Export Report Dialog Component
 * Allows users to select export format and customize filename
 */
export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onOpenChange,
  onExport,
  isLoading = false,
  defaultReportType,
  suggestedFilename = "bao-cao",
}) => {
  const [open, setOpen] = useState(isOpen ?? false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.CSV)
  const [filename, setFilename] = useState(suggestedFilename)
  const [isExporting, setIsExporting] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const handleExport = async () => {
    if (!filename.trim()) {
      toast.error("Vui lòng nhập tên file")
      return
    }

    try {
      setIsExporting(true)
      await onExport(selectedFormat, filename)
      setOpen(false)
      toast.success(`Xuất ${selectedFormat.toUpperCase()} thành công`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Lỗi xuất file")
    } finally {
      setIsExporting(false)
    }
  }

  const exportFormats = [
    {
      value: ExportFormat.CSV,
      label: "CSV",
      description: "Bảng tính (Excel, Sheets)",
      icon: FileSpreadsheet,
      available: true,
    },
    {
      value: ExportFormat.PDF,
      label: "PDF",
      description: "Tài liệu PDF (sắp có)",
      icon: FileJson,
      available: false,
    },
    {
      value: ExportFormat.EXCEL,
      label: "Excel",
      description: "Workbook Excel (sắp có)",
      icon: FileSpreadsheet,
      available: false,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Xuất nâng cao
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>
            Chọn định dạng file và đặt tên cho báo cáo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Định dạng xuất</Label>
            <div className="grid gap-2">
              {exportFormats.map((format) => {
                const Icon = format.icon
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    disabled={!format.available || isExporting}
                    className={`
                      relative flex items-start gap-3 p-3 rounded-lg border-2 transition-colors
                      ${
                        selectedFormat === format.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-muted hover:border-blue-300"
                      }
                      ${!format.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <div className="mt-1">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{format.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {format.description}
                      </p>
                    </div>
                    {selectedFormat === format.value && (
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">Tên file</Label>
            <div className="flex gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Nhập tên file"
                disabled={isExporting}
              />
              <span className="flex items-center text-sm text-muted-foreground">
                .{selectedFormat}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              File sẽ được lưu với tên: {filename}.{selectedFormat}
            </p>
          </div>

          {/* Format Info */}
          <Card className="bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              💡 Định dạng <strong>{selectedFormat.toUpperCase()}</strong> được khuyến nghị cho các bảng tính và phân tích dữ liệu nhanh chóng.
            </p>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isExporting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !exportFormats.find(f => f.value === selectedFormat)?.available}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
