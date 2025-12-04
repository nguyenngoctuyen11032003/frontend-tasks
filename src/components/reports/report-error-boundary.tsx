import React, { ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReportErrorBoundaryProps {
  error: string | null
  onRetry?: () => void
  children?: ReactNode
  isDismissible?: boolean
  onDismiss?: () => void
}

/**
 * Report Error Boundary Component
 * Displays error messages with retry and dismiss options
 */
export const ReportErrorBoundary: React.FC<ReportErrorBoundaryProps> = ({
  error,
  onRetry,
  children,
  isDismissible = true,
  onDismiss,
}) => {
  if (!error) {
    return <>{children}</>
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Lỗi tải dữ liệu báo cáo
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
              <div className="flex gap-2 mt-3">
                {onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    Thử lại
                  </Button>
                )}
                {isDismissible && onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    Bỏ qua
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  )
}

/**
 * Report Error Toast Component
 * Displays error in a toast-like format
 */
export const ReportErrorMessage: React.FC<{
  message: string
  variant?: "error" | "warning" | "info"
}> = ({ message, variant = "error" }) => {
  const variants = {
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-900",
      text: "text-red-900 dark:text-red-200",
      textMuted: "text-red-800 dark:text-red-300",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-200 dark:border-yellow-900",
      text: "text-yellow-900 dark:text-yellow-200",
      textMuted: "text-yellow-800 dark:text-yellow-300",
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-900",
      text: "text-blue-900 dark:text-blue-200",
      textMuted: "text-blue-800 dark:text-blue-300",
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
    },
  }

  const style = variants[variant]

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex gap-3`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div>
        <p className={`text-sm ${style.textMuted}`}>{message}</p>
      </div>
    </div>
  )
}
