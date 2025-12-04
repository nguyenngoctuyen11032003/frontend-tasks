import React from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ReportFilters {
  startDate: string
  endDate: string
  reportType?: string
  projectId?: string
}

export interface ReportFiltersProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  onApply?: () => void
  isLoading?: boolean
  reportTypes?: Array<{ value: string; label: string }>
  projects?: Array<{ id: string; name: string }>
}

/**
 * Report Filters Component
 * Provides UI for filtering reports by date range, type, and project
 */
export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  isLoading = false,
  reportTypes = [],
  projects = [],
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value,
    })
  }

  const handleReportTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      reportType: value,
    })
  }

  const handleProjectChange = (value: string) => {
    onFiltersChange({
      ...filters,
      projectId: value === "all" ? undefined : value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bộ lọc báo cáo</CardTitle>
        <CardDescription>Chọn tiêu chí để lọc dữ liệu báo cáo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleStartDateChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Ngày kết thúc</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleEndDateChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Report Type */}
          {reportTypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="reportType">Loại báo cáo</Label>
              <Select
                value={filters.reportType || ""}
                onValueChange={handleReportTypeChange}
                disabled={isLoading}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Project Filter */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project">Dự án</Label>
              <Select
                value={filters.projectId || "all"}
                onValueChange={handleProjectChange}
                disabled={isLoading}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Chọn dự án" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả dự án</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Apply Button */}
          {onApply && (
            <div className="flex items-end">
              <Button
                onClick={onApply}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Đang tải..." : "Áp dụng"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
