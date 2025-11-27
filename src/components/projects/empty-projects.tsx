"use client";

import { FolderKanban, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyProjectsProps {
  hasFilters?: boolean;
  onCreateProject?: () => void;
  onClearFilters?: () => void;
}

export function EmptyProjects({ hasFilters, onCreateProject, onClearFilters }: EmptyProjectsProps) {
  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy dự án</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Không có dự án nào khớp với bộ lọc của bạn. Thử thay đổi tiêu chí hoặc xóa bộ lọc.
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
          <FolderKanban className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Chưa có dự án nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Tạo dự án đầu tiên để bắt đầu tổ chức công việc theo nhóm. 
          Quản lý timeline, resources và team members một cách hiệu quả.
        </p>
        {onCreateProject && (
          <Button onClick={onCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo dự án đầu tiên
          </Button>
        )}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📊 Tổng quan</div>
            <p className="text-xs text-muted-foreground">
              Theo dõi tiến độ và metrics của dự án
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">👨‍💼 Quản lý</div>
            <p className="text-xs text-muted-foreground">
              Phân công công việc và quản lý team
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="font-semibold text-sm mb-1">📅 Timeline</div>
            <p className="text-xs text-muted-foreground">
              Đặt milestone và deadline rõ ràng
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
