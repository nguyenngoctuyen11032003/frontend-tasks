"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search,
  Grid3X3,
  List,
  Mail,
  MapPin,
  MoreHorizontal,
  UserPlus,
  MessageCircle,
  CheckCircle2,
  Clock,
  Users,
  Shield,
  Filter,
  X as XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteMemberModal } from "@/components/team/invite-member-modal"
import { EmailComposeModal } from "@/components/team/email-compose-modal"
import { RoleManagementDialog } from "@/components/team/role-management-dialog"
import { mockUsers, mockTasks, mockRoleDefinitions } from "@/mocks/data"
import { cn } from "@/lib/utils"
import type { User } from "@/types"

type ViewMode = "grid" | "list"
type StatusFilter = "all" | "online" | "away" | "offline"

export default function TeamPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState<User | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const router = useRouter()

  const departments = [...new Set(mockUsers.map((u) => u.department).filter(Boolean))]

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter)
    return matchesSearch && matchesStatus && matchesDepartment && matchesRole
  })

  const uniqueRoles = Array.from(new Set(mockUsers.flatMap((u) => u.roles)))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserStats = (userId: string) => {
    const userTasks = mockTasks.filter((t) => t.assignees.some((a) => a.id === userId))
    const completed = userTasks.filter((t) => t.status === "done").length
    const inProgress = userTasks.filter((t) => t.status === "in_progress").length
    return { total: userTasks.length, completed, inProgress }
  }

  const getRoleColor = (roleName: string) => {
    const role = mockRoleDefinitions.find((r) => r.name === roleName)
    return role?.color || "#64748b"
  }

  const getRoleDisplayName = (roleName: string) => {
    const role = mockRoleDefinitions.find((r) => r.name === roleName)
    return role?.displayName || roleName
  }

  const onlineCount = mockUsers.filter((u) => u.status === "online").length
  const totalCount = mockUsers.length

  const handleMessageUser = (user: User) => {
    // Navigate to chat page with user parameter
    router.push(`/chat?userId=${user.id}`)
  }

  const handleEmailUser = (user: User) => {
    setEmailRecipient(user)
    setIsEmailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Đội nhóm</h1>
          <p className="text-muted-foreground">
            {onlineCount} đang hoạt động / {totalCount} thành viên
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRoleManagementOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Quản lý vai trò
          </Button>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Mời thành viên
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Tổng thành viên",
            value: totalCount,
            icon: Users,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Đang hoạt động",
            value: onlineCount,
            icon: CheckCircle2,
            color: "text-green-600 bg-green-100 dark:bg-green-900/30",
          },
          {
            label: "Vắng mặt",
            value: mockUsers.filter((u) => u.status === "away").length,
            icon: Clock,
            color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
          },
          {
            label: "Ngoại tuyến",
            value: mockUsers.filter((u) => u.status === "offline").length,
            icon: Users,
            color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="online">Trực tuyến</SelectItem>
                    <SelectItem value="away">Vắng mặt</SelectItem>
                    <SelectItem value="offline">Ngoại tuyến</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhóm</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept!}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Shield className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || statusFilter !== "all" || departmentFilter !== "all" || roleFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Bộ lọc:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Trạng thái: {statusFilter === "online" ? "Trực tuyến" : statusFilter === "away" ? "Vắng mặt" : "Ngoại tuyến"}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {departmentFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Nhóm: {departmentFilter}
                    <button onClick={() => setDepartmentFilter("all")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {roleFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Vai trò: {getRoleDisplayName(roleFilter)}
                    <button onClick={() => setRoleFilter("all")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setDepartmentFilter("all")
                    setRoleFilter("all")
                  }}
                  className="h-7"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredUsers.length} / {totalCount} thành viên
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Không tìm thấy thành viên</h3>
          <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map((user, index) => {
            const stats = getUserStats(user.id)
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
                            user.status === "online"
                              ? "bg-green-500"
                              : user.status === "away"
                                ? "bg-yellow-500"
                                : "bg-gray-400",
                          )}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMessageUser(user); }}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Nhắn tin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEmailUser(user); }}>
                            <Mail className="mr-2 h-4 w-4" />
                            Gửi email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold mb-1">{user.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{user.role}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.roles.slice(0, 2).map((roleName) => (
                        <Badge
                          key={roleName}
                          variant="outline"
                          style={{
                            borderColor: getRoleColor(roleName),
                            color: getRoleColor(roleName),
                          }}
                          className="text-xs"
                        >
                          {getRoleDisplayName(roleName)}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Công việc</span>
                        <span>
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                      <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Thành viên</th>
                      <th className="text-left p-4 font-medium">Nhóm</th>
                      <th className="text-left p-4 font-medium">Vai trò</th>
                      <th className="text-left p-4 font-medium">Công việc</th>
                      <th className="text-left p-4 font-medium">Trạng thái</th>
                      <th className="text-right p-4 font-medium">Hành động</th>
                    </tr>
                  </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const stats = getUserStats(user.id)
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b hover:bg-muted/30 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span
                                className={cn(
                                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                  user.status === "online"
                                    ? "bg-green-500"
                                    : user.status === "away"
                                      ? "bg-yellow-500"
                                      : "bg-gray-400",
                                )}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{user.department || "-"}</p>
                          <p className="text-xs text-muted-foreground">{user.role}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((roleName) => (
                              <Badge
                                key={roleName}
                                variant="outline"
                                style={{
                                  borderColor: getRoleColor(roleName),
                                  color: getRoleColor(roleName),
                                }}
                                className="text-xs"
                              >
                                {getRoleDisplayName(roleName)}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                              className="h-1.5 w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                              {stats.completed}/{stats.total}
                            </span>
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
                            <span className="text-sm">
                              {user.status === "online"
                                ? "Trực tuyến"
                                : user.status === "away"
                                  ? "Vắng mặt"
                                  : "Ngoại tuyến"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Profile Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">{getInitials(selectedUser.name)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background",
                        selectedUser.status === "online"
                          ? "bg-green-500"
                          : selectedUser.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-400",
                      )}
                    />
                  </div>
                  <div>
                    <DialogTitle>{selectedUser.name}</DialogTitle>
                    <DialogDescription>{selectedUser.role}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="tasks">Công việc</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.department}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Vai trò</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.map((roleName) => (
                        <Badge
                          key={roleName}
                          style={{
                            backgroundColor: `${getRoleColor(roleName)}20`,
                            color: getRoleColor(roleName),
                          }}
                        >
                          {getRoleDisplayName(roleName)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                  <div className="space-y-3">
                    {mockTasks
                      .filter((t) => t.assignees.some((a) => a.id === selectedUser.id))
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.status === "done"
                                ? "Hoàn thành"
                                : task.status === "in_progress"
                                  ? "Đang làm"
                                  : task.status === "review"
                                    ? "Review"
                                    : "Chờ làm"}
                            </p>
                          </div>
                          <Badge variant={task.status === "done" ? "default" : "secondary"}>
                            {task.priority === "urgent"
                              ? "Khẩn cấp"
                              : task.priority === "high"
                                ? "Cao"
                                : task.priority === "medium"
                                  ? "Trung bình"
                                  : "Thấp"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-4">
                <Button className="flex-1" onClick={() => { handleMessageUser(selectedUser); setSelectedUser(null); }}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Nhắn tin
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => { handleEmailUser(selectedUser); setSelectedUser(null); }}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Member Modal */}
      <InviteMemberModal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen} />

      {/* Email Compose Modal */}
      <EmailComposeModal open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen} recipient={emailRecipient} />

      {/* Role Management Dialog */}
      <RoleManagementDialog open={isRoleManagementOpen} onOpenChange={setIsRoleManagementOpen} />
    </div>
  )
}
