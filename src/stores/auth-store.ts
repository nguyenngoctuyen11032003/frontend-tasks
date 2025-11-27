import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Permission, Role } from "@/types"
import api from "@/lib/api"
import socketClient from "@/lib/socket"
import { mockRoleDefinitions } from "@/mocks/data"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasRole: (role: Role) => boolean
  hasAnyRole: (roles: Role[]) => boolean
  getAllPermissions: () => Permission[]
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.login(email, password)
          api.setToken(response.token)
          socketClient.connect(response.token)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        api.setToken(null)
        socketClient.disconnect()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      getAllPermissions: () => {
        const { user } = get()
        if (!user) return []

        // Super admin has all permissions
        if (user.roles.includes("super_admin")) {
          return Object.values(mockRoleDefinitions).flatMap((role) => role.permissions) as Permission[]
        }

        // Collect permissions from all roles
        const rolePermissions = user.roles.flatMap((roleName) => {
          const roleDef = mockRoleDefinitions.find((r) => r.name === roleName)
          return roleDef?.permissions || []
        })

        // Combine with user's direct permissions
        const allPermissions = [...new Set([...rolePermissions, ...user.permissions])]
        return allPermissions as Permission[]
      },

      hasPermission: (permission: Permission) => {
        const { user, getAllPermissions } = get()
        if (!user) return false
        // Super admin has all permissions
        if (user.roles.includes("super_admin")) return true

        const allPermissions = getAllPermissions()
        return allPermissions.includes(permission)
      },

      hasAnyPermission: (permissions: Permission[]) => {
        const { hasPermission } = get()
        return permissions.some(hasPermission)
      },

      hasAllPermissions: (permissions: Permission[]) => {
        const { hasPermission } = get()
        return permissions.every(hasPermission)
      },

      hasRole: (role: Role) => {
        const { user } = get()
        if (!user) return false
        return user.roles.includes(role)
      },

      hasAnyRole: (roles: Role[]) => {
        const { user } = get()
        if (!user) return false
        return roles.some((role) => user.roles.includes(role))
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
