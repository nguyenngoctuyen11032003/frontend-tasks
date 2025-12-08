"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import React from "react"
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Settings,
  Mail,
  Server,
  Save,
  TrendingUp,
  Activity,
  UserCheck,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { PERMISSION_GROUPS, PERMISSION_LABELS, type Permission, type RoleDefinition, type User } from "@/types"
import { usePermission } from "@/hooks/use-permission"
import { useRolesStore } from "@/stores/roles-store"
import { useAdminStore } from "@/stores/admin-store"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  const { can, isSuperAdmin, isAdmin } = usePermission()
  const { roles, isLoading: rolesLoading, fetchRoles, createRole, updateRole, deleteRole } = useRolesStore()
  const { 
    dashboardStats, 
    statsLoading, 
    fetchDashboardStats,
    systemSettings,
    settingsLoading,
    fetchSystemSettings,
    updateSystemSetting,
    activityLogs,
    logsLoading,
    fetchActivityLogs,
    clearActivityLogs,
    systemHealth,
    healthLoading,
    fetchSystemHealth,
  } = useAdminStore()
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null)
  const [editingRole, setEditingRole] = useState<Partial<RoleDefinition>>({})
  const [expandedGroups, setExpandedGroups] = useState<string[]>(Object.keys(PERMISSION_GROUPS))
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("member")
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<{ key: string; value: string; description: string } | null>(null)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", phone: "", role: "member" })
  const [logsFilter, setLogsFilter] = useState({ action: "", entityType: "", search: "" })
  const [isClearLogsDialogOpen, setIsClearLogsDialogOpen] = useState(false)

  // Permission check - show warning if user doesn't have admin access
  useEffect(() => {
    console.log('🔐 Permission check:', {
      isSuperAdmin: isSuperAdmin(),
      isAdmin: isAdmin(),
      canViewSettings: can('settings.view'),
      canManageSettings: can('settings.manage'),
      canManageUsers: can('users.manage'),
    })

    if (!isAdmin() && !isSuperAdmin()) {
      toast.error('Bạn không có quyền truy cập trang này', {
        description: 'Chỉ Super Admin và Admin mới có thể truy cập trang Quản trị hệ thống'
      })
    }
  }, [can, isSuperAdmin, isAdmin])
  
  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch roles, dashboard stats, settings, activity logs, and users in parallel
        await Promise.all([
          fetchRoles(),
          fetchDashboardStats(),
          fetchSystemSettings(),
          fetchActivityLogs({ page: 1, limit: 10 }),
          fetchSystemHealth(),
        ])
        
        // Fetch users
        setUsersLoading(true)
        console.log('👥 Fetching users from API...')
        const usersData = await api.getUsers()
        console.log('✅ Users fetched:', usersData)
        console.log('📊 Users count:', usersData?.length || 0)
        setUsers(usersData)
      } catch (error: any) {
        console.error('❌ Failed to fetch data:', error)
        toast.error("Không thể tải dữ liệu", {
          description: error.message
        })
      } finally {
        setUsersLoading(false)
      }
    }
    loadData()
  }, [fetchRoles, fetchDashboardStats, fetchSystemSettings, fetchActivityLogs, fetchSystemHealth])

  // Auto-refresh system health every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemHealth()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchSystemHealth])

  // Debug: Log roles to check displayName
  useEffect(() => {
    if (roles.length > 0) {
      console.log('📋 Roles data:', roles.map((r, idx) => ({ 
        index: idx,
        id: r?.id,
        name: r?.name, 
        displayName: r?.displayName,
        hasDisplayName: !!r?.displayName,
        hasName: !!r?.name,
        isValid: !!(r?.name || r?.displayName)
      })))
      
      // Log invalid roles as warning only (not error)
      const invalidRoles = roles.filter(r => !r?.name && !r?.displayName)
      if (invalidRoles.length > 0) {
        console.warn('⚠️ Invalid roles detected (will be filtered):', invalidRoles)
      }
    }
  }, [roles])

  // Helper function to get display name with fallback
  const getRoleDisplayName = (role: RoleDefinition) => {
    // Return displayName if exists
    if (role?.displayName) return role.displayName
    
    // Return name if no displayName
    if (!role?.name) return 'Unknown Role'
    
    // Fallback: Format name to title case
    return role.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Helper function to get role initial
  const getRoleInitial = (role: RoleDefinition) => {
    if (!role) return 'R'
    const displayName = getRoleDisplayName(role)
    return displayName.charAt(0).toUpperCase()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Translate setting keys and descriptions to Vietnamese
  const translateSetting = (key: string, description?: string) => {
    const translations: Record<string, { label: string; description: string }> = {
      "app.email_verification_required": {
        label: "Yêu cầu xác thực email",
        description: "Bật để yêu cầu người dùng xác thực email trước khi sử dụng"
      },
      "app.registration_enabled": {
        label: "Cho phép đăng ký mới",
        description: "Bật để cho phép người dùng tự đăng ký tài khoản"
      },
      "email.enabled": {
        label: "Bật gửi email",
        description: "Bật/tắt tính năng gửi email thông báo"
      },
      "file.max_upload_size": {
        label: "Kích thước file tối đa",
        description: "Kích thước tối đa cho mỗi file upload (bytes)"
      },
      "file.max_attachments_per_task": {
        label: "Số file tối đa mỗi công việc",
        description: "Giới hạn số lượng file đính kèm cho mỗi công việc"
      },
      "max.upload.size": {
        label: "Kích thước upload tối đa",
        description: "Kích thước tối đa cho mỗi lần upload (bytes)"
      },
      "session.timeout_minutes": {
        label: "Thời gian hết hạn phiên",
        description: "Thời gian tự động đăng xuất khi không hoạt động (phút)"
      },
      "task.max_per_user": {
        label: "Số công việc tối đa mỗi người",
        description: "Giới hạn số lượng công việc mỗi người dùng có thể tạo"
      }
    }
    return translations[key] || { label: key, description: description || "" }
  }

  // Check if setting is boolean toggle type
  const isBooleanSetting = (key: string) => {
    return ["app.email_verification_required", "app.registration_enabled", "email.enabled"].includes(key)
  }

  // Handle toggle switch change
  const handleToggleSetting = async (setting: typeof systemSettings[0]) => {
    try {
      const newValue = setting.value === "true" ? "false" : "true"
      await updateSystemSetting(setting.key, {
        value: newValue,
        description: setting.description,
      })
      toast.success("Đã cập nhật cài đặt")
    } catch (error: any) {
      toast.error("Không thể cập nhật cài đặt", { description: error.message })
    }
  }

  // Filter valid roles only
  const validRoles = Array.isArray(roles) ? roles.filter(r => r && (r.name || r.displayName)) : []

  const filteredUsers = Array.isArray(users) ? users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  ) : []

  // Debug: Log users state
  useEffect(() => {
    console.log('👥 Users state updated:', {
      usersArray: users,
      usersCount: users?.length || 0,
      isArray: Array.isArray(users),
      filteredCount: filteredUsers.length,
      searchQuery
    })
  }, [users, filteredUsers, searchQuery])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => (prev.includes(groupKey) ? prev.filter((g) => g !== groupKey) : [...prev, groupKey]))
  }

  const handleCreateRole = () => {
    setEditingRole({
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      isSystem: false,
      color: "#3b82f6",
    })
    setSelectedRole(null)
    setIsRoleDialogOpen(true)
  }

  const handleEditRole = (role: RoleDefinition) => {
    // Allow editing system roles but with restrictions (only permissions)
    setEditingRole({ ...role })
    setSelectedRole(role)
    setIsRoleDialogOpen(true)
  }

  const handleDeleteRole = (role: RoleDefinition) => {
    if (role.isSystem) {
      toast.error("Không thể xóa vai trò hệ thống")
      return
    }
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete.id)
        toast.success(`Đã xóa vai trò "${roleToDelete.displayName}"`)
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
      } catch (error: any) {
        toast.error(error.message || "Không thể xóa vai trò")
        setIsDeleteDialogOpen(false)
        setRoleToDelete(null)
      }
    } else {
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const handleSaveRole = async () => {
    if (!editingRole.name || !editingRole.displayName) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      if (selectedRole) {
        // Update existing role
        // For system roles, only update permissions, not name/displayName
        const updateData: any = {
          description: editingRole.description,
          color: editingRole.color,
          permissions: editingRole.permissions?.map(String),
        }
        
        // Only allow name/displayName changes for non-system roles
        if (!selectedRole.isSystem) {
          updateData.name = editingRole.name
          updateData.displayName = editingRole.displayName
        }
        
        await updateRole(selectedRole.id, updateData)
        toast.success(`Đã cập nhật vai trò "${editingRole.displayName}"`)
      } else {
        // Create new role
        await createRole({
          name: editingRole.name?.toLowerCase().replace(/\s+/g, "_") || "",
          displayName: editingRole.displayName || "",
          description: editingRole.description,
          color: editingRole.color || "#3b82f6",
          permissions: editingRole.permissions?.map(String) || [],
        })
        toast.success(`Đã tạo vai trò "${editingRole.displayName}"`)
      }
      setIsRoleDialogOpen(false)
      setEditingRole({})
      setSelectedRole(null)
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu vai trò")
    }
  }

  const handleSendInvitation = async () => {
    if (!inviteEmail || !inviteRole) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Email không hợp lệ")
      return
    }

    try {
      setUsersLoading(true)
      // Find role ID from role name
      const selectedRole = roles.find(r => r.name === inviteRole)
      const roleIds = selectedRole ? [selectedRole.id] : []

      await api.inviteUser(inviteEmail, roleIds)

      toast.success(`📧 Đã gửi lời mời thành công!`, {
        description: `Email mời đã được gửi đến ${inviteEmail} với vai trò ${roles.find((r) => r.name === inviteRole)?.displayName}`,
      })

      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("member")
    } catch (error: any) {
      // Check if error is about pending invitation
      if (error.message?.includes('pending invitation') || error.message?.includes('already exists')) {
        toast.success(`📧 Đã gửi lại lời mời!`, {
          description: `Email mời đã được gửi lại đến ${inviteEmail}`,
        })
        setIsInviteDialogOpen(false)
        setInviteEmail("")
        setInviteRole("member")
      } else {
        toast.error("Không thể gửi lời mời", {
          description: error.message
        })
      }
    } finally {
      setUsersLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    try {
      setUsersLoading(true)
      // Find role ID from role name
      console.log('🔍 Looking for role:', newUserData.role)
      console.log('📋 Available roles:', roles)
      
      const selectedRole = roles.find(r => r.name === newUserData.role)
      console.log('✅ Found role:', selectedRole)
      
      const roleIds = selectedRole ? [selectedRole.id] : []
      console.log('🎯 RoleIds to send:', roleIds)

      const userData = {
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        phone: newUserData.phone || undefined,
        roleIds
      }
      console.log('📤 Sending user data:', userData)

      const newUser = await api.createUser(userData)
      console.log('✅ User created:', newUser)

      toast.success("🎉 Đã tạo tài khoản thành công!", {
        description: `Email với thông tin đăng nhập đã được gửi đến ${newUserData.email}`
      })

      // Refresh users list
      const usersData = await api.getUsers()
      setUsers(usersData)

      setIsAddUserDialogOpen(false)
      setNewUserData({ name: "", email: "", password: "", phone: "", role: "member" })
    } catch (error: any) {
      console.error('❌ Error creating user:', error)
      toast.error("Không thể thêm người dùng", {
        description: error.message
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    // Store original lock status to detect changes
    const userWithOriginal = {
      ...user,
      _originalIsLocked: user.isLocked
    }
    setEditingUser(userWithOriginal as any)
    setIsEditUserDialogOpen(true)
  }

  const handleSaveEditUser = async () => {
    if (!editingUser) return

    try {
      setUsersLoading(true)

      // Get current role name from user's roles array
      const currentRoleName = Array.isArray(editingUser.roles) && editingUser.roles.length > 0 
        ? (typeof editingUser.roles[0] === 'string' 
            ? editingUser.roles[0] 
            : (editingUser.roles[0] as any)?.name)
        : null

      console.log('🔍 Current role name:', currentRoleName)
      console.log('📋 Available roles:', roles)

      // Convert role name to roleIds
      const selectedRole = currentRoleName ? roles.find(r => r.name === currentRoleName) : null
      const roleIds = selectedRole ? [selectedRole.id] : undefined

      console.log('✅ Found role:', selectedRole)
      console.log('🎯 RoleIds to send:', roleIds)

      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        department: editingUser.department,
        jobRole: editingUser.jobRole,
        roleIds: roleIds,
      }

      console.log('📤 Sending update data:', updateData)

      // Update user info
      await api.updateUser(editingUser.id, updateData)

      // Handle lock/unlock if status changed
      const originalLocked = (editingUser as any)._originalIsLocked
      if (originalLocked !== editingUser.isLocked) {
        if (editingUser.isLocked) {
          await api.lockUser(editingUser.id)
          toast.success("Đã khóa tài khoản", { description: editingUser.name })
        } else {
          await api.unlockUser(editingUser.id)
          toast.success("Đã mở khóa tài khoản", { description: editingUser.name })
        }
      }

      toast.success("Đã cập nhật thông tin người dùng")

      // Refresh users list
      const usersData = await api.getUsers()
      setUsers(usersData)

      setIsEditUserDialogOpen(false)
      setEditingUser(null)
    } catch (error: any) {
      console.error('❌ Error updating user:', error)
      toast.error("Không thể cập nhật người dùng", {
        description: error.message
      })
    } finally {
      setUsersLoading(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteUserDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setUsersLoading(true)
      await api.deleteUser(userToDelete.id)
      toast.success(`Đã xóa người dùng "${userToDelete.name}"`)

      // Refresh users list
      const usersData = await api.getUsers()
      setUsers(usersData)

      setIsDeleteUserDialogOpen(false)
      setUserToDelete(null)
    } catch (error: any) {
      toast.error("Không thể xóa người dùng", {
        description: error.message
      })
      setIsDeleteUserDialogOpen(false)
      setUserToDelete(null)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleToggleLockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isLocked = u.isLocked
          toast.success(isLocked ? `Đã mở khóa tài khoản` : `Đã khóa tài khoản`)
          return { ...u, isLocked: !isLocked }
        }
        return u
      })
    )
  }

  const toggleAllPermissionsInGroup = (groupKey: string, permissions: Permission[]) => {
    const allSelected = permissions.every((p) => editingRole.permissions?.includes(p))
    setEditingRole((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions?.filter((p) => !permissions.includes(p))
        : [...new Set([...(prev.permissions || []), ...permissions])],
    }))
  }

  const togglePermission = (permission: Permission) => {
    setEditingRole((prev) => ({
      ...prev,
      permissions: prev.permissions?.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...(prev.permissions || []), permission],
    }))
  }

  const handleUserRoleChange = (userId: string, newRoles: string[]) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roles: newRoles as any } : u)))
    toast.success("Đã cập nhật vai trò người dùng")
  }

  const handleEditSetting = (setting: typeof systemSettings[0]) => {
    setEditingSetting({
      key: setting.key,
      value: setting.value,
      description: setting.description || "",
    })
    setIsSettingDialogOpen(true)
  }

  const handleSaveSetting = async () => {
    if (!editingSetting) return

    try {
      await updateSystemSetting(editingSetting.key, {
        value: editingSetting.value,
        description: editingSetting.description,
      })
      setIsSettingDialogOpen(false)
      setEditingSetting(null)
    } catch (error) {
      // Error handled by store
    }
  }

  const handleLockUser = async (userId: string) => {
    try {
      await api.lockUser(userId)
      toast.success("Đã khóa tài khoản người dùng")
      // Refresh users list
      const usersData = await api.getUsers()
      setUsers(usersData)
    } catch (error: any) {
      toast.error("Không thể khóa tài khoản", { description: error.message })
    }
  }

  const handleUnlockUser = async (userId: string) => {
    try {
      await api.unlockUser(userId)
      toast.success("Đã mở khóa tài khoản người dùng")
      // Refresh users list
      const usersData = await api.getUsers()
      setUsers(usersData)
    } catch (error: any) {
      toast.error("Không thể mở khóa tài khoản", { description: error.message })
    }
  }

  const handleClearLogs = async () => {
    try {
      await clearActivityLogs(90)
      setIsClearLogsDialogOpen(false)
    } catch (error) {
      // Error handled by store
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Permission check
  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
        <p className="text-muted-foreground">Bạn cần quyền Admin hoặc Super Admin để truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Quản trị hệ thống</h1>
        <p className="text-muted-foreground">Quản lý vai trò, phân quyền và người dùng</p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dashboardStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{dashboardStats.users.active}</span> hoạt động,{" "}
                <span className="text-gray-500">{dashboardStats.users.inactive}</span> không hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dự án</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.projects.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{dashboardStats.projects.active}</span> đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Công việc</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.tasks.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{dashboardStats.tasks.completed}</span> hoàn thành,{" "}
                <span className="text-orange-600">{dashboardStats.tasks.overdue}</span> quá hạn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vai trò</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                {roles.filter((r) => r.isSystem).length} hệ thống, {roles.filter((r) => !r.isSystem).length} tùy chỉnh
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Không có dữ liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Vai trò & Quyền
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            Cấu hình hệ thống
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Quản lý các vai trò và quyền hạn trong hệ thống</p>
            <Button onClick={handleCreateRole} disabled={rolesLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vai trò mới
            </Button>
          </div>

          {rolesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Đang tải vai trò...</p>
              </div>
            </div>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {validRoles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn("relative h-full", role.isSystem && "border-dashed")}>
                  {role.isSystem && (
                    <Badge variant="secondary" className="absolute right-3 top-3 text-xs">
                      Hệ thống
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: role.color || "#64748b" }}
                      >
                        {getRoleInitial(role)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{getRoleDisplayName(role)}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1 min-h-[60px] content-start">
                      {role.name === "super_admin" ? (
                        <Badge variant="outline" className="text-xs">
                          Tất cả quyền
                        </Badge>
                      ) : (
                        <>
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {PERMISSION_LABELS[perm as Permission] || perm}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.permissions.length - 3}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {Array.isArray(users) 
                          ? users.filter((u) => {
                              if (!u.roles || !Array.isArray(u.roles)) return false
                              return u.roles.some((r: any) => 
                                typeof r === 'string' ? r === role.name : r?.name === role.name
                              )
                            }).length 
                          : 0} người dùng
                      </span>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditRole(role)}
                                disabled={role.isSystem && !isSuperAdmin()}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {role.isSystem && !isSuperAdmin()
                                ? "Chỉ Super Admin mới có thể sửa vai trò hệ thống"
                                : "Chỉnh sửa"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteRole(role)}
                                disabled={role.isSystem}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {role.isSystem ? "Không thể xóa vai trò hệ thống" : "Xóa vai trò"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

          {/* Permission Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Ma trận phân quyền</CardTitle>
              <CardDescription>Tổng quan quyền hạn của các vai trò trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Quyền</th>
                      {Array.isArray(validRoles) && validRoles.map((role) => (
                        <th key={role.id} className="text-center p-2 font-medium min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: role.color || "#64748b" }}
                            >
                              {getRoleInitial(role)}
                            </div>
                            <span className="text-xs">{getRoleDisplayName(role)}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                      <React.Fragment key={groupKey}>
                        <tr className="bg-muted/30">
                          <td colSpan={Array.isArray(validRoles) ? validRoles.length + 1 : 2} className="p-2 font-medium">
                            {group.label}
                          </td>
                        </tr>
                        {group.permissions.map((perm) => (
                          <tr key={perm} className="border-b">
                            <td className="p-2 text-muted-foreground">{PERMISSION_LABELS[perm]}</td>
                            {Array.isArray(validRoles) && validRoles.map((role) => {
                              const hasPermission = role.name === "super_admin" || role.permissions.includes(perm)
                              return (
                                <td key={role.id} className="text-center p-2">
                                  {hasPermission ? (
                                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                                  ) : (
                                    <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddUserDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm người dùng
              </Button>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Mời người dùng
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Đang tải người dùng...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="font-medium">Không có người dùng nào</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "Không tìm thấy kết quả phù hợp" : "Bắt đầu bằng cách thêm người dùng mới"}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button onClick={() => setIsAddUserDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm người dùng đầu tiên
                    </Button>
                  )}
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Người dùng</th>
                      <th className="text-left p-4 font-medium">Phòng ban</th>
                      <th className="text-left p-4 font-medium">Vai trò</th>
                      <th className="text-left p-4 font-medium">Trạng thái</th>
                      <th className="text-right p-4 font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b hover:bg-muted/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{user.department || "-"}</p>
                          <p className="text-xs text-muted-foreground">{user.role || "-"}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((roleItem: any) => {
                                // Handle both RoleDefinition object and string
                                const roleName = typeof roleItem === 'string' ? roleItem : roleItem?.name
                                const roleObj = typeof roleItem === 'string' 
                                  ? roles.find((r) => r.name === roleItem)
                                  : roleItem
                                return (
                                  <Badge
                                    key={roleName || 'unknown'}
                                    variant="outline"
                                    style={{
                                      borderColor: roleObj?.color,
                                      color: roleObj?.color,
                                    }}
                                  >
                                    {roleObj?.displayName || roleName}
                                  </Badge>
                                )
                              })
                            ) : (
                              <span className="text-sm text-muted-foreground">Chưa có vai trò</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                user.status === "online"
                                  ? "bg-green-500"
                                  : user.status === "away"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400",
                              )}
                            />
                            <span className="text-sm capitalize">
                              {user.status === "online"
                                ? "Trực tuyến"
                                : user.status === "away"
                                  ? "Vắng mặt"
                                  : "Ngoại tuyến"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      if (user.isLocked) {
                                        handleUnlockUser(user.id)
                                      } else {
                                        handleLockUser(user.id)
                                      }
                                    }}
                                  >
                                    {user.isLocked ? (
                                      <Unlock className="h-4 w-4" />
                                    ) : (
                                      <Lock className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {user.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          {/* System Health Widget */}
          {systemHealth && (
            <Card className={cn(
              "border-2",
              systemHealth.status === "healthy" ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    <CardTitle className="text-lg">Trạng thái hệ thống</CardTitle>
                  </div>
                  <Badge variant={systemHealth.status === "healthy" ? "default" : "destructive"}>
                    {systemHealth.status === "healthy" ? "Khỏe mạnh" : "Có vấn đề"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cơ sở dữ liệu</p>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        systemHealth.database.status === "connected" ? "bg-green-500" : "bg-red-500"
                      )} />
                      <p className="font-medium">
                        {systemHealth.database.status === "connected" ? "Đã kết nối" : "Mất kết nối"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bộ nhớ sử dụng</p>
                    <p className="font-medium">{systemHealth.server.memoryUsage} MB</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Thời gian hoạt động</p>
                    <p className="font-medium">{formatUptime(systemHealth.server.uptime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cài đặt hệ thống</CardTitle>
                <CardDescription>Quản lý các thiết lập toàn hệ thống</CardDescription>
              </div>
              {can("settings.manage") && (
                <Badge variant="outline" className="gap-1">
                  <Settings className="h-3 w-3" />
                  {systemSettings.length} cài đặt
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : systemSettings.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Chưa có cài đặt nào</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group settings by category */}
                  {[
                    { 
                      title: "Ứng dụng", 
                      icon: Settings, 
                      keys: ["app.email_verification_required", "app.registration_enabled"],
                      color: "text-blue-600 dark:text-blue-400",
                      bgColor: "bg-blue-50 dark:bg-blue-950"
                    },
                    { 
                      title: "Email", 
                      icon: Mail, 
                      keys: ["email.enabled"],
                      color: "text-purple-600 dark:text-purple-400",
                      bgColor: "bg-purple-50 dark:bg-purple-950"
                    },
                    { 
                      title: "Tệp tin & Upload", 
                      icon: Server, 
                      keys: ["file.max_upload_size", "file.max_attachments_per_task", "max.upload.size"],
                      color: "text-orange-600 dark:text-orange-400",
                      bgColor: "bg-orange-50 dark:bg-orange-950"
                    },
                    { 
                      title: "Phiên làm việc", 
                      icon: Activity, 
                      keys: ["session.timeout_minutes"],
                      color: "text-green-600 dark:text-green-400",
                      bgColor: "bg-green-50 dark:bg-green-950"
                    },
                    { 
                      title: "Công việc", 
                      icon: TrendingUp, 
                      keys: ["task.max_per_user"],
                      color: "text-pink-600 dark:text-pink-400",
                      bgColor: "bg-pink-50 dark:bg-pink-950"
                    },
                  ].map((category) => {
                    // Filter out app.name and app.version
                    const categorySettings = systemSettings.filter(s => 
                      category.keys.some(key => s.key.toLowerCase().includes(key.toLowerCase())) &&
                      !["app.name", "app.version"].includes(s.key)
                    )
                    
                    if (categorySettings.length === 0) return null
                    
                    const Icon = category.icon
                    
                    return (
                      <div key={category.title} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-2 rounded-lg", category.bgColor)}>
                            <Icon className={cn("h-5 w-5", category.color)} />
                          </div>
                          <h3 className="font-semibold text-lg">{category.title}</h3>
                        </div>
                        <div className="grid gap-3 ml-12">
                          {categorySettings.map((setting) => {
                            const translated = translateSetting(setting.key, setting.description)
                            const isToggle = isBooleanSetting(setting.key)
                            
                            return (
                              <div
                                key={setting.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-card"
                              >
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-base">{translated.label}</p>
                                    {setting.isPublic && (
                                      <Badge variant="secondary" className="text-xs">
                                        Công khai
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{translated.description}</p>
                                  {!isToggle && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="font-mono text-sm">
                                        {setting.value}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                {can("settings.manage") && (
                                  isToggle ? (
                                    <Switch
                                      checked={setting.value === "true"}
                                      onCheckedChange={() => handleToggleSetting(setting)}
                                      className="ml-4"
                                    />
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditSetting(setting)}
                                      className="ml-4"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Uncategorized settings */}
                  {(() => {
                    const categorizedKeys = [
                      "app.name", "app.version", "app.email_verification_required", "app.registration_enabled",
                      "email.enabled",
                      "file.max_upload_size", "file.max_attachments_per_task", "max.upload.size",
                      "session.timeout_minutes",
                      "task.max_per_user"
                    ]
                    const uncategorized = systemSettings.filter(s => 
                      !categorizedKeys.some(key => s.key.toLowerCase().includes(key.toLowerCase())) &&
                      !["app.name", "app.version"].includes(s.key)
                    )
                    
                    if (uncategorized.length === 0) return null
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-950">
                            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <h3 className="font-semibold text-lg">Khác</h3>
                        </div>
                        <div className="grid gap-3 ml-12">
                          {uncategorized.map((setting) => {
                            const translated = translateSetting(setting.key, setting.description)
                            const isToggle = isBooleanSetting(setting.key)
                            
                            return (
                              <div
                                key={setting.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-card"
                              >
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-base">{translated.label}</p>
                                    {setting.isPublic && (
                                      <Badge variant="secondary" className="text-xs">
                                        Công khai
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{translated.description}</p>
                                  {!isToggle && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="font-mono text-sm">
                                        {setting.value}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                {can("settings.manage") && (
                                  isToggle ? (
                                    <Switch
                                      checked={setting.value === "true"}
                                      onCheckedChange={() => handleToggleSetting(setting)}
                                      className="ml-4"
                                    />
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditSetting(setting)}
                                      className="ml-4"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nhật ký hoạt động</CardTitle>
                  <CardDescription>Theo dõi các hoạt động trong hệ thống</CardDescription>
                </div>
                {can("settings.manage") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsClearLogsDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa logs cũ
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !activityLogs || activityLogs.items.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Chưa có nhật ký hoạt động</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.items.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={log.user?.avatarUrl} />
                        <AvatarFallback>{getInitials(log.user?.name || "U")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{log.user?.name || "Unknown"}</span>
                          {" "}
                          <span className="text-muted-foreground">{log.action}</span>
                          {" "}
                          <span className="font-medium">{log.entityType}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activityLogs.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Trang {activityLogs.page} / {activityLogs.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={activityLogs.page === 1}
                          onClick={() => fetchActivityLogs({ page: activityLogs.page - 1, limit: 10 })}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={activityLogs.page === activityLogs.totalPages}
                          onClick={() => fetchActivityLogs({ page: activityLogs.page + 1, limit: 10 })}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Edit/Create Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}</DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Cập nhật thông tin và quyền hạn cho vai trò này"
                : "Tạo vai trò mới với các quyền hạn tùy chỉnh"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Tên hiển thị *</Label>
                <Input
                  id="role-name"
                  placeholder="VD: Developer"
                  value={editingRole.displayName || ""}
                  onChange={(e) =>
                    setEditingRole((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                      name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2">
                  {["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingRole((prev) => ({ ...prev, color }))}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        editingRole.color === color && "ring-2 ring-offset-2 ring-primary scale-110",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-desc">Mô tả</Label>
              <Input
                id="role-desc"
                placeholder="Mô tả vai trò..."
                value={editingRole.description || ""}
                onChange={(e) => setEditingRole((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Quyền hạn</Label>
                <span className="text-sm text-muted-foreground">
                  {editingRole.permissions?.length || 0} quyền đã chọn
                </span>
              </div>

              <div className="space-y-2 border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                  const isExpanded = expandedGroups.includes(groupKey)
                  const selectedInGroup = group.permissions.filter((p) => editingRole.permissions?.includes(p)).length
                  const allSelected = selectedInGroup === group.permissions.length

                  return (
                    <Collapsible key={groupKey} open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
                      <div className="flex items-center justify-between py-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="font-medium">{group.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {selectedInGroup}/{group.permissions.length}
                            </Badge>
                          </Button>
                        </CollapsibleTrigger>
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleAllPermissionsInGroup(groupKey, group.permissions)}
                        />
                      </div>
                      <CollapsibleContent className="pl-6 space-y-2">
                        {group.permissions.map((permission) => (
                          <div key={permission} className="flex items-center justify-between py-1">
                            <Label htmlFor={permission} className="text-sm font-normal cursor-pointer">
                              {PERMISSION_LABELS[permission]}
                            </Label>
                            <Checkbox
                              id={permission}
                              checked={editingRole.permissions?.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveRole}>{selectedRole ? "Cập nhật" : "Tạo vai trò"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa vai trò
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vai trò "{roleToDelete?.displayName}"? Hành động này không thể hoàn tác và sẽ
              ảnh hưởng đến tất cả người dùng có vai trò này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa vai trò
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản người dùng mới trong hệ thống
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Họ và tên *</Label>
              <Input
                id="new-user-name"
                placeholder="Nguyễn Văn A"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email *</Label>
              <Input
                id="new-user-email"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-password">Mật khẩu *</Label>
              <Input
                id="new-user-password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-phone">Số điện thoại</Label>
              <Input
                id="new-user-phone"
                type="tel"
                placeholder="0901234567"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-role">Vai trò *</Label>
              <Select value={newUserData.role} onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}>
                <SelectTrigger id="new-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validRoles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: role.color || "#64748b" }}
                        />
                        {getRoleDisplayName(role)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và vai trò của người dùng
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Họ và tên</Label>
                <Input
                  id="edit-user-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-user-role">Vai trò</Label>
                <Select 
                  value={editingUser.roles[0]} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, roles: [value as any] })}
                >
                  <SelectTrigger id="edit-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: role.color || "#64748b" }}
                          />
                          {getRoleDisplayName(role)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trạng thái tài khoản</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {editingUser.isLocked ? (
                      <Lock className="h-5 w-5 text-red-600" />
                    ) : (
                      <Unlock className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {editingUser.isLocked ? "Tài khoản đã khóa" : "Tài khoản hoạt động"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {editingUser.isLocked 
                          ? "Người dùng không thể đăng nhập" 
                          : "Người dùng có thể đăng nhập bình thường"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser({ ...editingUser, isLocked: !editingUser.isLocked })}
                  >
                    {editingUser.isLocked ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Mở khóa
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Khóa tài khoản
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEditUser}>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa người dùng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng "{userToDelete?.name}"? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa người dùng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Mời người dùng mới
            </DialogTitle>
            <DialogDescription>
              Gửi lời mời qua email để người dùng tham gia hệ thống
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Vai trò *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter((r) => !r.isSystem || r.name === "member")
                    .map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: role.color }}
                          />
                          {role.displayName}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Người dùng sẽ được gán vai trò này khi chấp nhận lời mời
              </p>
            </div>

            <div className="rounded-lg border p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Quyền hạn của vai trò</h4>
              <div className="space-y-1 text-sm">
                {roles
                  .find((r) => r.name === inviteRole)
                  ?.permissions.slice(0, 5)
                  .map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-green-600" />
                      {PERMISSION_LABELS[perm]}
                    </div>
                  ))}
                {(roles.find((r) => r.name === inviteRole)?.permissions?.length || 0) > 5 && (
                  <p className="text-xs text-muted-foreground italic">
                    +{(roles.find((r) => r.name === inviteRole)?.permissions?.length || 0) - 5} quyền khác
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSendInvitation}>
              <Mail className="mr-2 h-4 w-4" />
              Gửi lời mời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Setting Dialog */}
      <Dialog open={isSettingDialogOpen} onOpenChange={setIsSettingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa cài đặt</DialogTitle>
            <DialogDescription>
              Cập nhật giá trị cài đặt hệ thống
            </DialogDescription>
          </DialogHeader>

          {editingSetting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input value={editingSetting.key} disabled className="font-mono" />
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={editingSetting.value}
                  onChange={(e) =>
                    setEditingSetting({ ...editingSetting, value: e.target.value })
                  }
                  placeholder="Nhập giá trị"
                />
              </div>

              <div className="space-y-2">
                <Label>Mô tả (tùy chọn)</Label>
                <Input
                  value={editingSetting.description}
                  onChange={(e) =>
                    setEditingSetting({ ...editingSetting, description: e.target.value })
                  }
                  placeholder="Nhập mô tả"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSettingDialogOpen(false)
                setEditingSetting(null)
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveSetting} disabled={settingsLoading}>
              {settingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Activity Logs Dialog */}
      <AlertDialog open={isClearLogsDialogOpen} onOpenChange={setIsClearLogsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhật ký cũ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa tất cả nhật ký hoạt động cũ hơn 90 ngày. Dữ liệu đã xóa không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa nhật ký
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
