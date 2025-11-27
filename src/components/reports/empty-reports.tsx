"use client";

import { BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyReportsProps {
  onSelectDateRange?: () => void;
}

export function EmptyReports({ onSelectDateRange }: EmptyReportsProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <BarChart3 className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu báo cáo</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Bắt đầu làm việc và hoàn thành công việc để xem thống kê và báo cáo chi tiết. 
          Dữ liệu sẽ được cập nhật theo thời gian thực.
        </p>
        {onSelectDateRange && (
          <Button onClick={onSelectDateRange} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Chọn khoảng thời gian
          </Button>
        )}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📈 Hiệu suất</div>
            <p className="text-xs text-muted-foreground">
              Theo dõi năng suất làm việc của team
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📊 Thống kê</div>
            <p className="text-xs text-muted-foreground">
              Xem biểu đồ và metrics chi tiết
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📥 Export</div>
            <p className="text-xs text-muted-foreground">
              Xuất báo cáo PDF và Excel
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
