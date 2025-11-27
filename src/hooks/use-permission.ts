"use client"

import { useAuthStore } from "@/stores/auth-store"
import type { Permission, Role } from "@/types"

export function usePermission() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, getAllPermissions, user } =
    useAuthStore()

  const can = (permission: Permission) => hasPermission(permission)

  const canAny = (permissions: Permission[]) => hasAnyPermission(permissions)

  const canAll = (permissions: Permission[]) => hasAllPermissions(permissions)

  const is = (role: Role) => hasRole(role)

  const isAny = (roles: Role[]) => hasAnyRole(roles)

  const isSuperAdmin = () => user?.roles.includes("super_admin") ?? false

  const isAdmin = () => user?.roles.includes("super_admin") || user?.roles.includes("admin") || false

  const isManager = () =>
    user?.roles.includes("super_admin") || user?.roles.includes("admin") || user?.roles.includes("manager") || false

  const permissions = getAllPermissions()

  return {
    can,
    canAny,
    canAll,
    is,
    isAny,
    isSuperAdmin,
    isAdmin,
    isManager,
    permissions,
    user,
  }
}
