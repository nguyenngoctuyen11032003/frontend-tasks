"use client";

import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Bell className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-2">Chưa có thông báo</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Bạn sẽ nhận được thông báo khi có hoạt động mới trong dự án
      </p>
    </div>
  );
}
