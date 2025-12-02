import { create } from "zustand"
import { devtools } from "zustand/middleware"
import api from "@/lib/api"
import type { RoleDefinition } from "@/types"

interface RolesState {
  // State
  roles: RoleDefinition[]
  availablePermissions: string[]
  isLoading: boolean
  isFetching: boolean
  error: string | null

  // Actions
  fetchRoles: () => Promise<void>
  fetchRole: (id: string) => Promise<RoleDefinition | null>
  fetchAvailablePermissions: () => Promise<void>
  createRole: (data: {
    name: string
    displayName: string
    description?: string
    color?: string
    permissions: string[]
  }) => Promise<RoleDefinition>
  updateRole: (
    id: string,
    data: {
      name?: string
      displayName?: string
      description?: string
      color?: string
      permissions?: string[]
    }
  ) => Promise<RoleDefinition>
  updateRolePermissions: (id: string, permissions: string[]) => Promise<RoleDefinition>
  deleteRole: (id: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

const initialState = {
  roles: [],
  availablePermissions: [],
  isLoading: false,
  isFetching: false,
  error: null,
}

export const useRolesStore = create<RolesState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchRoles: async () => {
        set({ isFetching: true, error: null })
        try {
          const roles = await api.getRoles()
          set({ roles, isFetching: false })
        } catch (error: any) {
          set({
            error: error.message || "Không thể tải danh sách vai trò",
            isFetching: false,
          })
          throw error
        }
      },

      fetchRole: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const role = await api.getRole(id)
          // Update role in the list if exists
          const roles = get().roles
          const index = roles.findIndex((r) => r.id === id)
          if (index !== -1) {
            const newRoles = [...roles]
            newRoles[index] = role
            set({ roles: newRoles, isLoading: false })
          } else {
            set({ roles: [...roles, role], isLoading: false })
          }
          return role
        } catch (error: any) {
          set({
            error: error.message || "Không thể tải thông tin vai trò",
            isLoading: false,
          })
          return null
        }
      },

      fetchAvailablePermissions: async () => {
        try {
          const response = await api.getAvailablePermissions()
          set({ availablePermissions: response.permissions })
        } catch (error: any) {
          set({
            error: error.message || "Không thể tải danh sách quyền",
          })
          throw error
        }
      },

      createRole: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const newRole = await api.createRole(data)
          set({
            roles: [...get().roles, newRole],
            isLoading: false,
          })
          return newRole
        } catch (error: any) {
          set({
            error: error.message || "Không thể tạo vai trò mới",
            isLoading: false,
          })
          throw error
        }
      },

      updateRole: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
          const updatedRole = await api.updateRole(id, data)
          const roles = get().roles
          const index = roles.findIndex((r) => r.id === id)
          if (index !== -1) {
            const newRoles = [...roles]
            newRoles[index] = updatedRole
            set({ roles: newRoles, isLoading: false })
          }
          return updatedRole
        } catch (error: any) {
          set({
            error: error.message || "Không thể cập nhật vai trò",
            isLoading: false,
          })
          throw error
        }
      },

      updateRolePermissions: async (id, permissions) => {
        set({ isLoading: true, error: null })
        try {
          const updatedRole = await api.updateRolePermissions(id, permissions)
          const roles = get().roles
          const index = roles.findIndex((r) => r.id === id)
          if (index !== -1) {
            const newRoles = [...roles]
            newRoles[index] = updatedRole
            set({ roles: newRoles, isLoading: false })
          }
          return updatedRole
        } catch (error: any) {
          set({
            error: error.message || "Không thể cập nhật quyền",
            isLoading: false,
          })
          throw error
        }
      },

      deleteRole: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await api.deleteRole(id)
          set({
            roles: get().roles.filter((r) => r.id !== id),
            isLoading: false,
          })
        } catch (error: any) {
          set({
            error: error.message || "Không thể xóa vai trò",
            isLoading: false,
          })
          throw error
        }
      },

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: "roles-store",
    }
  )
)
