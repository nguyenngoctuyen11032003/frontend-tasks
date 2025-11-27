"use client";

import { Clock } from "lucide-react";

export function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Clock className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-2">Chưa có hoạt động</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Hoạt động của dự án sẽ được hiển thị tại đây
      </p>
    </div>
  );
}
