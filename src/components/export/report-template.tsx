"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileDown, Calendar, User, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ReportData {
  title: string
  description?: string
  dateRange: {
    from: Date
    to: Date
  }
  generatedBy: string
  generatedAt: Date
  sections: Array<{
    title: string
    data: Array<{
      label: string
      value: string | number
      trend?: {
        value: number
        isPositive: boolean
      }
    }>
  }>
  charts?: React.ReactNode
  summary?: string
}

interface ReportTemplateProps {
  data: ReportData
  onExport?: () => void
}

export function ReportTemplate({ data, onExport }: ReportTemplateProps) {
  return (
    <div id="report-content" className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          {data.description && (
            <p className="text-muted-foreground mt-2">{data.description}</p>
          )}
        </div>
        {onExport && (
          <Button onClick={onExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Khoảng thời gian</p>
                <p className="text-xs text-muted-foreground">
                  {format(data.dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                  {format(data.dateRange.to, "dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Người tạo</p>
                <p className="text-xs text-muted-foreground">{data.generatedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ngày tạo</p>
                <p className="text-xs text-muted-foreground">
                  {format(data.generatedAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sections */}
      {data.sections.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {section.data.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{item.value}</p>
                    {item.trend && (
                      <Badge
                        variant={item.trend.isPositive ? "default" : "destructive"}
                        className="gap-1"
                      >
                        {item.trend.isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(item.trend.value)}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Charts */}
      {data.charts && (
        <div className="space-y-6">
          <Separator />
          {data.charts}
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-6">
        <p>Báo cáo được tạo tự động bởi TaskMaster</p>
        <p>© {new Date().getFullYear()} TaskMaster. All rights reserved.</p>
      </div>
    </div>
  )
}
