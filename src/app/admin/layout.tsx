import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionDenied } from "@/components/auth/permission-denied"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionGuard
      roles="admin"
      fallback={
        <PermissionDenied 
          message="Bạn cần có vai trò Admin để truy cập trang này"
          requiredRole="Admin"
        />
      }
    >
      {children}
    </PermissionGuard>
  )
}
