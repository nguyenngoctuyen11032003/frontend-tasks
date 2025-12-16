"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Plus, Trash2, Edit, Save, X, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PERMISSION_LABELS } from "@/lib/constants"
import { useRolesStore } from "@/stores/roles-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { RoleDefinition, Permission } from "@/types"

interface RoleManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleManagementDialog({ open, onOpenChange }: RoleManagementDialogProps) {
  const {
    roles,
    availablePermissions,
    isLoading,
    isFetching,
    error,
    fetchRoles,
    fetchAvailablePermissions,
    createRole,
    updateRole,
    deleteRole,
    clearError,
  } = useRolesStore()

  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDisplayName, setEditDisplayName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editColor, setEditColor] = useState("#3b82f6")
  const [editPermissions, setEditPermissions] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Fetch roles and permissions when dialog opens
  useEffect(() => {
    if (open) {
      fetchRoles()
      fetchAvailablePermissions()
    }
  }, [open, fetchRoles, fetchAvailablePermissions])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Group permissions by category
  const permissionsByCategory: Record<string, Permission[]> = {}
  Object.keys(PERMISSION_LABELS).forEach((permission) => {
    const category = permission.split(".")[0]
    if (!permissionsByCategory[category]) {
      permissionsByCategory[category] = []
    }
    permissionsByCategory[category].push(permission as Permission)
  })

  const categoryLabels: Record<string, string> = {
    projects: "Dự án",
    tasks: "Công việc",
    notes: "Ghi chú",
    chat: "Trò chuyện",
    reports: "Báo cáo",
    users: "Người dùng",
    roles: "Vai trò",
    settings: "Cài đặt",
    team: "Đội nhóm",
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelectRole = (role: RoleDefinition) => {
    setSelectedRole(role)
    setIsEditing(false)
    setIsCreating(false)
  }

  const handleEditRole = () => {
    if (!selectedRole) return
    setEditName(selectedRole.name)
    setEditDisplayName(selectedRole.displayName)
    setEditDescription(selectedRole.description)
    setEditColor(selectedRole.color)
    setEditPermissions(selectedRole.permissions)
    setIsEditing(true)
    setExpandedCategories(new Set(Object.keys(permissionsByCategory)))
  }

  const handleCreateRole = () => {
    setEditName("")
    setEditDisplayName("")
    setEditDescription("")
    setEditColor("#3b82f6")
    setEditPermissions([])
    setIsCreating(true)
    setIsEditing(false)
    setSelectedRole(null)
    setExpandedCategories(new Set(Object.keys(permissionsByCategory)))
  }

  const handleSaveRole = async () => {
    if (!editDisplayName.trim()) {
      toast.error("Vui lòng nhập tên vai trò")
      return
    }

    try {
      if (isCreating) {
        const newRole = await createRole({
          name: editName || editDisplayName.toLowerCase().replace(/\s+/g, "_"),
          displayName: editDisplayName,
          description: editDescription,
          color: editColor,
          permissions: editPermissions,
        })
        setSelectedRole(newRole)
        toast.success("Đã tạo vai trò mới")
      } else if (selectedRole) {
        const updatedRole = await updateRole(selectedRole.id, {
          name: editName,
          displayName: editDisplayName,
          description: editDescription,
          color: editColor,
          permissions: editPermissions,
        })
        setSelectedRole(updatedRole)
        toast.success("Đã cập nhật vai trò")
      }

      setIsEditing(false)
      setIsCreating(false)
    } catch (error: any) {
      // Error toast handled by store
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
  }

  const handleDeleteRole = async (role: RoleDefinition) => {
    if (role.isSystem) {
      toast.error("Không thể xóa vai trò hệ thống")
      return
    }

    try {
      await deleteRole(role.id)
      if (selectedRole?.id === role.id) {
        setSelectedRole(null)
      }
      toast.success("Đã xóa vai trò")
    } catch (error: any) {
      // Error toast handled by store
    }
  }

  const togglePermission = (permission: string) => {
    if (editPermissions.includes(permission)) {
      setEditPermissions(editPermissions.filter((p) => p !== permission))
    } else {
      setEditPermissions([...editPermissions, permission])
    }
  }

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = permissionsByCategory[category] as string[]
    const allSelected = categoryPerms.every((p) => editPermissions.includes(p))
    if (allSelected) {
      setEditPermissions(editPermissions.filter((p) => !categoryPerms.includes(p)))
    } else {
      setEditPermissions([...new Set([...editPermissions, ...categoryPerms])])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý vai trò
          </DialogTitle>
          <DialogDescription>
            Tạo và quản lý vai trò với các quyền truy cập cho từng vai trò
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="roles" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="roles">
              Danh sách vai trò ({roles.length})
              {isFetching && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
            </TabsTrigger>
            <TabsTrigger value="permissions">Chi tiết quyền</TabsTrigger>
          </TabsList>

            <TabsContent value="roles" className="flex-1 mt-4 overflow-hidden">
              {isFetching && roles.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Đang tải vai trò...</p>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Roles List */}
                <div className="col-span-1 border-r pr-4 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="font-medium text-sm">Vai trò</h3>
                    <Button size="sm" variant="outline" onClick={handleCreateRole}>
                      <Plus className="h-3 w-3 mr-1" />
                      Tạo mới
                    </Button>
                  </div>
                  <div 
                    className="flex-1 overflow-y-auto pr-2"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
                    }}
                  >
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <motion.div
                          key={role.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-sm",
                              selectedRole?.id === role.id && "ring-2 ring-primary"
                            )}
                            onClick={() => handleSelectRole(role)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded"
                                    style={{ backgroundColor: role.color }}
                                  />
                                  <span className="font-medium text-sm">{role.displayName}</span>
                                </div>
                                {role.isSystem && (
                                  <Badge variant="secondary" className="text-xs">
                                    Hệ thống
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {role.description}
                              </p>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {role.permissions.length} quyền
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

              {/* Role Details/Edit */}
              <div className="col-span-2 flex flex-col overflow-hidden">
                {isEditing || isCreating ? (
                  <div 
                    className="flex-1 overflow-y-auto pr-2"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
                    }}
                  >
                    <div className="space-y-4 pb-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">
                            Tên vai trò <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="displayName"
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            placeholder="vd: Manager"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name">Mã vai trò</Label>
                          <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="vd: manager"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Mô tả</Label>
                          <Textarea
                            id="description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Mô tả vai trò và trách nhiệm..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="color">Màu sắc</Label>
                          <div className="flex gap-2 items-center">
                            <Input
                              id="color"
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-20 h-10"
                            />
                            <Input
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label>Quyền truy cập</Label>
                          {Object.entries(permissionsByCategory).map(([category, perms]) => {
                            const isExpanded = expandedCategories.has(category)
                            const selectedCount = perms.filter((p) => editPermissions.includes(p)).length
                            const allSelected = selectedCount === perms.length

                            return (
                              <Card key={category}>
                                <CardHeader className="p-3">
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => toggleCategory(category)}
                                      className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                      {categoryLabels[category] || category}
                                      <Badge variant="secondary" className="text-xs">
                                        {selectedCount}/{perms.length}
                                      </Badge>
                                    </button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCategoryPermissions(category)}
                                    >
                                      {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                    </Button>
                                  </div>
                                </CardHeader>
                                {isExpanded && (
                                  <CardContent className="p-3 pt-0 space-y-2">
                                    {perms.map((permission) => (
                                      <div
                                        key={permission}
                                        className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
                                      >
                                        <Checkbox
                                          id={permission}
                                          checked={editPermissions.includes(permission)}
                                          onCheckedChange={() => togglePermission(permission)}
                                        />
                                        <Label
                                          htmlFor={permission}
                                          className="text-sm cursor-pointer flex-1"
                                        >
                                          {PERMISSION_LABELS[permission]}
                                        </Label>
                                      </div>
                                    ))}
                                  </CardContent>
                                )}
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : selectedRole ? (
                    <div 
                      className="flex-1 overflow-y-auto pr-2"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
                      }}
                    >
                      <div className="space-y-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="h-4 w-4 rounded"
                                style={{ backgroundColor: selectedRole.color }}
                              />
                              <h3 className="text-xl font-semibold">{selectedRole.displayName}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleEditRole}>
                              <Edit className="h-3 w-3 mr-1" />
                              Sửa
                            </Button>
                            {!selectedRole.isSystem && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRole(selectedRole)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Xóa
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Thông tin</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Mã vai trò:</span>
                              <span className="ml-2 font-mono">{selectedRole.name}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Loại:</span>
                              <span className="ml-2">
                                {selectedRole.isSystem ? "Hệ thống" : "Tùy chỉnh"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">
                            Quyền truy cập ({selectedRole.permissions.length})
                          </h4>
                          {Object.entries(permissionsByCategory).map(([category, perms]) => {
                            const categoryPerms = perms.filter((p) =>
                              selectedRole.permissions.includes(p)
                            )
                            if (categoryPerms.length === 0) return null

                            return (
                              <Card key={category}>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">
                                    {categoryLabels[category] || category}
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      {categoryPerms.length}
                                    </Badge>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <div className="flex flex-wrap gap-2">
                                    {categoryPerms.map((permission) => (
                                      <Badge key={permission} variant="outline" className="text-xs">
                                        {PERMISSION_LABELS[permission]}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                      <Shield className="h-16 w-16 mb-4 opacity-50" />
                      <p>Chọn một vai trò để xem chi tiết</p>
                    </div>
                  )}
                </div>
              </div>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="flex-1 mt-4 overflow-hidden">
              <div 
                className="h-full overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--muted-foreground)) transparent'
                }}
              >
                <div className="space-y-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    Danh sách tất cả các quyền có sẵn trong hệ thống
                  </p>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          {categoryLabels[category] || category}
                          <Badge variant="secondary">{perms.length} quyền</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {perms.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center justify-between p-2 rounded border text-sm"
                            >
                              <div>
                                <span className="font-medium">{PERMISSION_LABELS[permission]}</span>
                                <span className="ml-2 text-xs text-muted-foreground font-mono">
                                  ({permission})
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {roles.filter((r) => r.permissions.includes(permission)).length} vai trò
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

        <DialogFooter className="shrink-0">
          {isEditing || isCreating ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button onClick={handleSaveRole}>
                <Save className="mr-2 h-4 w-4" />
                {isCreating ? "Tạo vai trò" : "Lưu thay đổi"}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
