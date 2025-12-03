"use client"
import { useEffect, useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trash2, X } from "lucide-react"
import { useProjectsStore } from "@/stores/projects-store"
import { UsersService } from "@/services/users.service"
import type { User } from "@/types"
import { toast } from "sonner"
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

interface MembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function MembersDialog({ open, onOpenChange, projectId }: MembersDialogProps) {
  const { getProject, addMembers, removeMember } = useProjectsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isAddLoading, setIsAddLoading] = useState(false)
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const project = getProject(projectId)
  const currentMemberIds = project?.members?.map((m: any) => m.id) || []
  const availableUsers = allUsers.filter((user) => !currentMemberIds.includes(user.id))
  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch all users when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setSelectedUserIds([])
      fetchUsers()
    }
  }, [open])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const result = await UsersService.getUsers({ limit: 100 })
      setAllUsers(result.data)
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng")
      console.error("Failed to fetch users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle add members
  const handleAddMembers = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thành viên")
      return
    }

    setIsAddLoading(true)
    try {
      await addMembers(projectId, selectedUserIds)
      toast.success(`Đã thêm ${selectedUserIds.length} thành viên`)
      setSelectedUserIds([])
      setSearchQuery("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi thêm thành viên"
      toast.error(errorMessage)
    } finally {
      setIsAddLoading(false)
    }
  }

  // Handle remove member
  const handleRemoveMember = async () => {
    if (!removingMemberId) return

    setIsRemoveLoading(true)
    try {
      await removeMember(projectId, removingMemberId)
      toast.success("Đã xóa thành viên")
      setShowRemoveConfirm(false)
      setRemovingMemberId(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi xóa thành viên"
      toast.error(errorMessage)
    } finally {
      setIsRemoveLoading(false)
    }
  }

  const removingMember = project?.members?.find((m: any) => m.id === removingMemberId)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý thành viên</DialogTitle>
            <DialogDescription>Thêm hoặc xóa thành viên khỏi dự án</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Members Section */}
            <div className="space-y-3">
              <h3 className="font-semibold">Thành viên hiện tại ({project?.members?.length || 0})</h3>
              {project?.members && project.members.length > 0 ? (
                <div className="space-y-2">
                  {project.members.map((member: any) => (
                    <Card key={member.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRemovingMemberId(member.id)
                            setShowRemoveConfirm(true)
                          }}
                          disabled={isRemoveLoading}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có thành viên nào</p>
              )}
            </div>

              {/* Add Members Section */}
            <div className="space-y-3 border-t pt-6">
              <h3 className="font-semibold">Thêm thành viên</h3>
              <div className="space-y-2">
                <Label htmlFor="member-search">Tìm kiếm người dùng</Label>
                <Input
                  id="member-search"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isAddLoading || loadingUsers}
                />
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách người dùng...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`cursor-pointer transition-colors ${
                        selectedUserIds.includes(user.id) ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500" : ""
                      }`}
                    >
                      <CardContent
                        className="p-3 flex items-center gap-3"
                        onClick={() => {
                          setSelectedUserIds((prev) =>
                            prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                          )
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div
                          className={`h-4 w-4 rounded border-2 transition-colors ${
                            selectedUserIds.includes(user.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchQuery ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy người dùng</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Tất cả người dùng đã là thành viên</p>
              )}

              {selectedUserIds.length > 0 && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    Đã chọn {selectedUserIds.length} người dùng
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedUserIds([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAddLoading}>
              Đóng
            </Button>
            {filteredUsers.length > 0 && selectedUserIds.length > 0 && (
              <Button onClick={handleAddMembers} disabled={isAddLoading} className="flex items-center gap-2">
                {isAddLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAddLoading ? "Đang thêm..." : `Thêm ${selectedUserIds.length} thành viên`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xóa {removingMember?.name} khỏi dự án này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoveLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoveLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoveLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
