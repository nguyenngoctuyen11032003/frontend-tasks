import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionDenied } from "@/components/auth/permission-denied"

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionGuard
      permissions="reports.view"
      fallback={
        <PermissionDenied 
          message="Bạn cần có quyền xem báo cáo để truy cập trang này"
          requiredPermission="reports.view"
        />
      }
    >
      {children}
    </PermissionGuard>
  )
}
