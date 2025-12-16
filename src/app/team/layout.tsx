import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionDenied } from "@/components/auth/permission-denied"

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionGuard
      permissions="users.view"
      fallback={
        <PermissionDenied 
          message="Bạn cần có quyền xem người dùng để truy cập trang này"
          requiredPermission="users.view"
        />
      }
    >
      {children}
    </PermissionGuard>
  )
}
