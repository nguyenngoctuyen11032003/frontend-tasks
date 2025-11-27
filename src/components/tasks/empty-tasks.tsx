"use client";

import { CheckSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyTasksProps {
  hasFilters?: boolean;
  onCreateTask?: () => void;
  onClearFilters?: () => void;
}

export function EmptyTasks({ hasFilters, onCreateTask, onClearFilters }: EmptyTasksProps) {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy công việc</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Không có công việc nào khớp với bộ lọc của bạn. Thử thay đổi tiêu chí tìm kiếm hoặc xóa bộ lọc.
          </p>
          {onClearFilters && (
            <Button onClick={onClearFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <CheckSquare className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có công việc nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Bắt đầu tổ chức công việc của bạn bằng cách tạo công việc đầu tiên. 
          Theo dõi tiến độ, đặt deadline và cộng tác với team.
        </p>
        {onCreateTask && (
          <Button onClick={onCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo công việc đầu tiên
          </Button>
        )}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📋 Tổ chức</div>
            <p className="text-xs text-muted-foreground">
              Quản lý công việc theo dự án và ưu tiên
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">🎯 Theo dõi</div>
            <p className="text-xs text-muted-foreground">
              Cập nhật trạng thái và tiến độ realtime
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">👥 Cộng tác</div>
            <p className="text-xs text-muted-foreground">
              Làm việc nhóm hiệu quả với team
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
