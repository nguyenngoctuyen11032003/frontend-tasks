"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Đã xảy ra lỗi nghiêm trọng</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ứng dụng gặp lỗi không mong muốn
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
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tải lại ứng dụng
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Button>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                  Nếu lỗi vẫn tiếp diễn:
                </p>
                <ul className="mt-2 text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                  <li>Thử xóa cache trình duyệt</li>
                  <li>Kiểm tra kết nối mạng</li>
                  <li>Liên hệ bộ phận hỗ trợ kỹ thuật</li>
                </ul>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục trong thời gian sớm nhất
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
