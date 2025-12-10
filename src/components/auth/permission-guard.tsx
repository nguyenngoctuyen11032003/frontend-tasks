    "use client"

import type { ReactNode } from "react"
import { usePermission } from "@/hooks/use-permission"
import type { Permission, Role } from "@/types"

interface PermissionGuardProps {
  children: ReactNode
  /**
   * Required permissions - user must have ALL of these
   */
  permissions?: Permission | Permission[]
  /**
   * Alternative permissions - user must have AT LEAST ONE
   */
  anyPermissions?: Permission[]
  /**
   * Required roles - user must have ONE of these
   */
  roles?: Role | Role[]
  /**
   * Fallback content when user doesn't have permission
   */
  fallback?: ReactNode
  /**
   * If true, renders nothing instead of fallback
   */
  hideWhenUnauthorized?: boolean
}

/**
 * Permission Guard Component
 * 
 * Hides or shows content based on user permissions and roles.
 * Super admin bypasses all checks.
 * 
 * @example
 * // Check single permission
 * <PermissionGuard permissions="tasks.create">
 *   <CreateTaskButton />
 * </PermissionGuard>
 * 
 * @example
 * // Check multiple permissions (must have ALL)
 * <PermissionGuard permissions={["tasks.create", "tasks.assign"]}>
 *   <AdvancedTaskForm />
 * </PermissionGuard>
 * 
 * @example
 * // Check any permission (must have AT LEAST ONE)
 * <PermissionGuard anyPermissions={["tasks.update", "tasks.delete"]}>
 *   <TaskActions />
 * </PermissionGuard>
 * 
 * @example
 * // Check role
 * <PermissionGuard roles="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * @example
 * // With fallback
 * <PermissionGuard 
 *   permissions="reports.export"
 *   fallback={<div>You need export permission</div>}
 * >
 *   <ExportButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permissions,
  anyPermissions,
  roles,
  fallback = null,
  hideWhenUnauthorized = false,
}: PermissionGuardProps) {
  const { can, canAny, canAll, is, isAny, isSuperAdmin } = usePermission()

  // Super admin bypasses all checks
  if (isSuperAdmin()) {
    return <>{children}</>
  }

  let hasAccess = true

  // Check roles first
  if (roles) {
    if (Array.isArray(roles)) {
      hasAccess = isAny(roles)
    } else {
      hasAccess = is(roles)
    }
  }

  // Check permissions if roles check passed
  if (hasAccess && permissions) {
    if (Array.isArray(permissions)) {
      hasAccess = canAll(permissions)
    } else {
      hasAccess = can(permissions)
    }
  }

  // Check any permissions
  if (hasAccess && anyPermissions && anyPermissions.length > 0) {
    hasAccess = canAny(anyPermissions)
  }

  if (!hasAccess) {
    return hideWhenUnauthorized ? null : <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook-based permission checking
 * Use this when you need conditional logic, not just rendering
 * 
 * @example
 * const { hasAccess } = usePermissionCheck({ permissions: "tasks.create" })
 * if (hasAccess) {
 *   // do something
 * }
 */
export function usePermissionCheck({
  permissions,
  anyPermissions,
  roles,
}: Omit<PermissionGuardProps, "children" | "fallback" | "hideWhenUnauthorized">) {
  const { can, canAny, canAll, is, isAny, isSuperAdmin } = usePermission()

  // Super admin bypasses all checks
  if (isSuperAdmin()) {
    return { hasAccess: true }
  }

  let hasAccess = true

  // Check roles
  if (roles) {
    if (Array.isArray(roles)) {
      hasAccess = isAny(roles)
    } else {
      hasAccess = is(roles)
    }
  }

  // Check permissions
  if (hasAccess && permissions) {
    if (Array.isArray(permissions)) {
      hasAccess = canAll(permissions)
    } else {
      hasAccess = can(permissions)
    }
  }

  // Check any permissions
  if (hasAccess && anyPermissions && anyPermissions.length > 0) {
    hasAccess = canAny(anyPermissions)
  }

  return { hasAccess }
}
