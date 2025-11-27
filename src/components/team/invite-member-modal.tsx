"use client"

import { useState } from "react"
import { Mail, UserPlus, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { mockRoleDefinitions } from "@/mocks/data"
import { PERMISSION_LABELS } from "@/types"
import type { RoleDefinition } from "@/types"

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [emailList, setEmailList] = useState<string[]>([])

  const getRoleColor = (roleName: string) => {
    const role = mockRoleDefinitions.find((r) => r.name === roleName)
    return role?.color || "#64748b"
  }

  const handleAddEmail = () => {
    if (email && !emailList.includes(email) && isValidEmail(email)) {
      setEmailList([...emailList, email])
      setEmail("")
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter((e) => e !== emailToRemove))
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSendInvites = () => {
    // Logic to send invites would go here
    console.log("Sending invites to:", emailList, "with role:", selectedRole)
    // Reset form
    setEmailList([])
    setEmail("")
    setSelectedRole("")
    onOpenChange(false)
  }

  const selectedRoleData = mockRoleDefinitions.find((r) => r.name === selectedRole)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Mời thành viên mới
          </DialogTitle>
          <DialogDescription>
            Gửi lời mời tham gia đội nhóm qua email. Người nhận sẽ nhận được email chứa liên kết xác nhận.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Địa chỉ email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button type="button" onClick={handleAddEmail} disabled={!email || !isValidEmail(email)}>
                Thêm
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nhập email và nhấn "Thêm" hoặc Enter để thêm nhiều người nhận
            </p>
          </div>

          {/* Email List */}
          {emailList.length > 0 && (
            <div className="space-y-2">
              <Label>Danh sách người nhận ({emailList.length})</Label>
              <div className="flex flex-wrap gap-2">
                {emailList.map((email) => (
                  <Badge key={email} variant="secondary" className="pr-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Chọn vai trò cho thành viên mới" />
              </SelectTrigger>
              <SelectContent>
                {mockRoleDefinitions
                  .filter((role) => !role.isSystem || role.name === "member" || role.name === "guest")
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
              Vai trò xác định quyền truy cập và hành động mà thành viên có thể thực hiện
            </p>
          </div>

          {/* Role Permission Preview */}
          {selectedRoleData && (
            <Card className="border-2" style={{ borderColor: `${selectedRoleData.color}30` }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: selectedRoleData.color }}
                  >
                    {selectedRoleData.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold" style={{ color: selectedRoleData.color }}>
                      {selectedRoleData.displayName}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRoleData.description}
                    </p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div>
                  <p className="text-sm font-medium mb-2">
                    Quyền hạn ({selectedRoleData.permissions.length})
                  </p>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {selectedRoleData.permissions.slice(0, 10).map((permission) => (
                      <div key={permission} className="flex items-center gap-2 text-xs">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: selectedRoleData.color }}
                        />
                        <span className="text-muted-foreground">
                          {PERMISSION_LABELS[permission]}
                        </span>
                      </div>
                    ))}
                    {selectedRoleData.permissions.length > 10 && (
                      <p className="text-xs text-muted-foreground italic">
                        +{selectedRoleData.permissions.length - 10} quyền khác
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={handleSendInvites}
            disabled={emailList.length === 0 || !selectedRole}
            className="flex-1"
          >
            <Mail className="mr-2 h-4 w-4" />
            Gửi lời mời ({emailList.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
