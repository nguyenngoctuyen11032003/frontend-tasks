"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PermissionDeniedProps {
  message?: string
  requiredPermission?: string
  requiredRole?: string
}

export function PermissionDenied({ 
  message = "Bạn không có quyền truy cập trang này",
  requiredPermission,
  requiredRole 
}: PermissionDeniedProps) {
  const router = useRouter()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Không có quyền truy cập</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredPermission && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-muted-foreground">Quyền yêu cầu:</p>
              <p className="font-mono text-xs">{requiredPermission}</p>
            </div>
          )}
          {requiredRole && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-muted-foreground">Vai trò yêu cầu:</p>
              <p className="font-mono text-xs">{requiredRole}</p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
