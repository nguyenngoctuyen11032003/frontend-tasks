"use client";

import { Search, Command } from "lucide-react";

export function EmptySearchResults() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-3">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">Không tìm thấy kết quả</h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        Thử tìm kiếm với từ khóa khác
      </p>
    </div>
  );
}

export function EmptyCommandPalette() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-3">
        <Command className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">Bắt đầu gõ để tìm kiếm</h3>
      <p className="text-xs text-muted-foreground max-w-xs">
        Tìm công việc, dự án, ghi chú hoặc thành viên
      </p>
    </div>
  );
}
