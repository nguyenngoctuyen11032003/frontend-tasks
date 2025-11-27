"use client"
import { useState } from "react"
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
import { mockUsers, mockRoleDefinitions } from "@/mocks/data"
import { PERMISSION_GROUPS, PERMISSION_LABELS, type Permission, type RoleDefinition, type User } from "@/types"
import { usePermission } from "@/hooks/use-permission"
import { cn } from "@/lib/utils"

export default function AdminPage() {
  const { can, isSuperAdmin, isAdmin } = usePermission()
  const [roles, setRoles] = useState<RoleDefinition[]>(mockRoleDefinitions)
  const [users, setUsers] = useState<User[]>(mockUsers)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id))
      toast.success(`Đã xóa vai trò "${roleToDelete.displayName}"`)
    }
    setIsDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  const handleSaveRole = () => {
    if (!editingRole.name || !editingRole.displayName) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (selectedRole) {
      // Update existing role
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? { ...r, ...editingRole, updatedAt: new Date().toISOString() } : r)),
      )
      toast.success(`Đã cập nhật vai trò "${editingRole.displayName}"`)
    } else {
      // Create new role
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}`,
        name: editingRole.name?.toLowerCase().replace(/\s+/g, "_") || "",
        displayName: editingRole.displayName || "",
        description: editingRole.description || "",
        permissions: editingRole.permissions || [],
        isSystem: false,
        color: editingRole.color || "#3b82f6",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRoles((prev) => [...prev, newRole])
      toast.success(`Đã tạo vai trò "${newRole.displayName}"`)
    }
    setIsRoleDialogOpen(false)
  }

  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteRole) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Simulate sending invitation
    toast.success(`Đã gửi lời mời đến ${inviteEmail}`, {
      description: `Vai trò: ${roles.find((r) => r.name === inviteRole)?.displayName}`,
    })
    setIsInviteDialogOpen(false)
    setInviteEmail("")
    setInviteRole("member")
  }

  const togglePermission = (permission: Permission) => {
    setEditingRole((prev) => ({
      ...prev,
      permissions: prev.permissions?.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...(prev.permissions || []), permission],
    }))
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

  const handleUserRoleChange = (userId: string, newRoles: string[]) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roles: newRoles as any } : u)))
    toast.success("Đã cập nhật vai trò người dùng")
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{users.filter((u) => u.status === "online").length}</span> đang trực
              tuyến
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
              {roles.filter((r) => !r.isSystem).length} vai trò tùy chỉnh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((users.filter((u) => u.status === "online").length / users.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Tỷ lệ người dùng hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.roles.includes("admin") || u.roles.includes("super_admin")).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.filter((u) => u.roles.includes("super_admin")).length} Super Admin
            </p>
          </CardContent>
        </Card>
      </div>

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
            <Button onClick={handleCreateRole}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vai trò mới
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn("relative", role.isSystem && "border-dashed")}>
                  {role.isSystem && (
                    <Badge variant="secondary" className="absolute right-3 top-3 text-xs">
                      Hệ thống
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.displayName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{role.displayName}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
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
                        {users.filter((u) => u.roles.includes(role.name as any)).length} người dùng
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
                      {roles.slice(0, 5).map((role) => (
                        <th key={role.id} className="text-center p-2 font-medium min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className="h-6 w-6 rounded flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: role.color }}
                            >
                              {role.displayName.charAt(0)}
                            </div>
                            <span className="text-xs">{role.displayName}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                      <React.Fragment key={groupKey}>
                        <tr className="bg-muted/30">
                          <td colSpan={6} className="p-2 font-medium">
                            {group.label}
                          </td>
                        </tr>
                        {group.permissions.map((perm) => (
                          <tr key={perm} className="border-b">
                            <td className="p-2 text-muted-foreground">{PERMISSION_LABELS[perm]}</td>
                            {roles.slice(0, 5).map((role) => {
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
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mời người dùng
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
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
                            {user.roles.map((roleName) => {
                              const role = roles.find((r) => r.name === roleName)
                              return (
                                <Badge
                                  key={roleName}
                                  variant="outline"
                                  style={{
                                    borderColor: role?.color,
                                    color: role?.color,
                                  }}
                                >
                                  {role?.displayName || roleName}
                                </Badge>
                              )
                            })}
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
                          <Select
                            value={user.roles[0]}
                            onValueChange={(value) => handleUserRoleChange(user.id, [value])}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.name}>
                                  {role.displayName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình ứng dụng</CardTitle>
              <CardDescription>Các thiết lập toàn hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tên ứng dụng</Label>
                <Input defaultValue="TaskMaster" />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Đăng ký & Truy cập</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cho phép đăng ký mới</p>
                    <p className="text-sm text-muted-foreground">Người dùng mới có thể tự đăng ký tài khoản</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Xác thực email bắt buộc</p>
                    <p className="text-sm text-muted-foreground">Yêu cầu xác thực email khi đăng ký</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chế độ bảo trì</p>
                    <p className="text-sm text-muted-foreground">Tạm dừng hệ thống, chỉ admin truy cập</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Giám sát & Logging</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ghi log hoạt động</p>
                    <p className="text-sm text-muted-foreground">Lưu lại tất cả hoạt động người dùng</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ghi log API</p>
                    <p className="text-sm text-muted-foreground">Ghi lại các request API</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Cấu hình Email
              </CardTitle>
              <CardDescription>Thiết lập máy chủ email để gửi thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input placeholder="smtp.gmail.com" defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input placeholder="587" type="number" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label>Email người gửi</Label>
                  <Input placeholder="noreply@company.com" type="email" defaultValue="noreply@taskmaster.app" />
                </div>
                <div className="space-y-2">
                  <Label>Tên người gửi</Label>
                  <Input placeholder="TaskMaster" defaultValue="TaskMaster System" />
                </div>
                <div className="space-y-2">
                  <Label>Username SMTP</Label>
                  <Input placeholder="user@gmail.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Password SMTP</Label>
                  <Input placeholder="••••••••" type="password" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="ssl" defaultChecked />
                <Label htmlFor="ssl" className="font-normal">
                  Sử dụng SSL/TLS
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  Test kết nối
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giới hạn hệ thống</CardTitle>
              <CardDescription>Các giới hạn và ràng buộc của hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kích thước file upload tối đa (MB)</Label>
                  <Input type="number" defaultValue="10" />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unlimited-file-size" />
                    <Label htmlFor="unlimited-file-size" className="font-normal text-sm">
                      Không giới hạn
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Số lượng file đính kèm tối đa</Label>
                  <Input type="number" defaultValue="5" />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unlimited-attachments" />
                    <Label htmlFor="unlimited-attachments" className="font-normal text-sm">
                      Không giới hạn
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Thời gian session (phút)</Label>
                  <Input type="number" defaultValue="60" />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unlimited-session" />
                    <Label htmlFor="unlimited-session" className="font-normal text-sm">
                      Không giới hạn
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Số lượng task tối đa/user</Label>
                  <Input type="number" defaultValue="100" />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="unlimited-tasks" />
                    <Label htmlFor="unlimited-tasks" className="font-normal text-sm">
                      Không giới hạn
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình
                </Button>
              </div>
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
    </div>
  )
}
