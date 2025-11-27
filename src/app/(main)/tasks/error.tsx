"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tasks page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[600px] items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl">Lỗi tải Công việc</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Không thể tải danh sách công việc
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-2">Chi tiết lỗi:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
              className="flex-1"
            >
              Về Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Bạn vẫn có thể thử tạo công việc mới sau khi tải lại trang
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
