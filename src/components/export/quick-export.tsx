"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileDown, FileSpreadsheet, FileJson, FileText, Printer } from "lucide-react"
import { exportToCSV, exportToJSON, generateFilename } from "@/lib/export-utils"
import { toast } from "sonner"

interface QuickExportProps {
  data: any[]
  filename: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function QuickExport({ data, filename, variant = "outline", size = "sm" }: QuickExportProps) {
  const handleExport = (format: "csv" | "json") => {
    try {
      if (format === "csv") {
        exportToCSV(data, filename)
      } else {
        exportToJSON(data, filename)
      }

      toast.success("Xuất thành công", {
        description: `Đã xuất ${data.length} bản ghi sang ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Lỗi xuất dữ liệu", {
        description: "Có lỗi xảy ra khi xuất dữ liệu",
      })
    }
  }

  const handlePrint = () => {
    window.print()
    toast.info("In báo cáo", {
      description: "Sử dụng Ctrl/Cmd+P hoặc in từ trình duyệt",
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <FileDown className="h-4 w-4 mr-2" />
          Xuất dữ liệu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Xuất dữ liệu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="mr-2 h-4 w-4 text-green-600" />
          <span>Xuất CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="mr-2 h-4 w-4 text-blue-600" />
          <span>Xuất JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
          <span>Xuất Excel</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4 text-red-600" />
          <span>In / Lưu PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
