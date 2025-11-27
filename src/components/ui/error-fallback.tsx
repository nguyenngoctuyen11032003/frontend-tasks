"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: Error;
  message?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  message = "Đã xảy ra lỗi",
  onRetry,
  showDetails = false,
}: ErrorFallbackProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{message}</p>
            {showDetails && error && (
              <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
                {error.message}
              </p>
            )}
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Thử lại
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
