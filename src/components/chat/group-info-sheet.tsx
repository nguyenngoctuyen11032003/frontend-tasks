"use client"

import { useState } from "react"
import { 
  Users, 
  UserPlus, 
  Image as ImageIcon, 
  File, 
  Link as LinkIcon, 
  LogOut,
  X,
  Search,
  Download,
  ExternalLink,
  FileText,
  Video,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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
import { mockUsers } from "@/mocks/data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ChatRoom, User } from "@/types"

interface GroupInfoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: ChatRoom | null
  currentUserId: string
}

export function GroupInfoSheet({ open, onOpenChange, room, currentUserId }: GroupInfoSheetProps) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  if (!room || room.type !== "group") return null

  const members = mockUsers.filter((u) => room.members.includes(u.id))
  const availableUsers = mockUsers.filter((u) => !room.members.includes(u.id) && u.id !== currentUserId)
  
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleAddMembers = () => {
    if (selectedMembers.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên")
      return
    }
    toast.success(`Đã thêm ${selectedMembers.length} thành viên vào nhóm`)
    setIsAddMemberOpen(false)
    setSelectedMembers([])
    setSearchQuery("")
  }

  const handleLeaveGroup = () => {
    toast.success("Đã rời khỏi nhóm")
    setIsLeaveDialogOpen(false)
    onOpenChange(false)
  }

  // Mock data for media, files, links
  const sharedMedia = [
    { id: "1", type: "image", url: "/placeholder.svg", name: "Screenshot 2024.png", date: "Hôm nay" },
    { id: "2", type: "video", url: "/placeholder.svg", name: "Demo.mp4", date: "Hôm qua" },
    { id: "3", type: "image", url: "/placeholder.svg", name: "Design.jpg", date: "2 ngày trước" },
  ]

  const sharedFiles = [
    { id: "1", name: "Project_Plan.docx", size: "2.4 MB", date: "Hôm nay", icon: FileText },
    { id: "2", name: "Presentation.pdf", size: "5.1 MB", date: "Hôm qua", icon: File },
    { id: "3", name: "Budget.xlsx", size: "890 KB", date: "3 ngày trước", icon: FileText },
  ]

  const sharedLinks = [
    { id: "1", url: "https://github.com/project", title: "GitHub Repository", date: "Hôm nay" },
    { id: "2", url: "https://docs.google.com/document", title: "Google Docs", date: "2 ngày trước" },
    { id: "3", url: "https://figma.com/design", title: "Figma Design", date: "1 tuần trước" },
  ]

  const groupPosts = [
    { id: "1", author: members[0], content: "Đã cập nhật timeline dự án", date: "2 giờ trước" },
    { id: "2", author: members[1], content: "Meeting notes đã được chia sẻ", date: "1 ngày trước" },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle>{room.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{members.length} thành viên</p>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="members" className="flex-1">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="members" className="text-xs">
                  <Users className="h-4 w-4 mr-1" />
                  Thành viên
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs">
                  <File className="h-4 w-4 mr-1" />
                  File
                </TabsTrigger>
                <TabsTrigger value="links" className="text-xs">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(100vh-240px)]">
              {/* Members Tab */}
              <TabsContent value="members" className="mt-4 px-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Thành viên nhóm ({members.length})</h3>
                  <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                            member.status === "online"
                              ? "bg-green-500"
                              : member.status === "away"
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                      </div>
                      {member.id === currentUserId && (
                        <Badge variant="secondary">Bạn</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="mt-4 px-6">
                <h3 className="font-medium mb-4">Ảnh & Video</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.map((media) => (
                    <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {media.type === "video" && <Video className="h-8 w-8 text-white" />}
                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-white">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {sharedMedia.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có ảnh hoặc video nào</p>
                  </div>
                )}
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="mt-4 px-6">
                <h3 className="font-medium mb-4">File đã chia sẻ</h3>
                <div className="space-y-2">
                  {sharedFiles.map((file) => {
                    const Icon = file.icon
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent group">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.size} • {file.date}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
                {sharedFiles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có file nào được chia sẻ</p>
                  </div>
                )}
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="mt-4 px-6">
                <h3 className="font-medium mb-4">Link đã chia sẻ</h3>
                <div className="space-y-2">
                  {sharedLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent group">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{link.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                        <p className="text-xs text-muted-foreground">{link.date}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {sharedLinks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có link nào được chia sẻ</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="p-6 border-t">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsLeaveDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Rời khỏi nhóm
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm thành viên</DialogTitle>
            <DialogDescription>Chọn người để thêm vào nhóm chat</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thành viên..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                {selectedMembers.map((memberId) => {
                  const member = mockUsers.find((u) => u.id === memberId)
                  if (!member) return null
                  return (
                    <Badge key={memberId} variant="secondary" className="gap-1 pr-1">
                      {member.name}
                      <button
                        onClick={() => toggleMember(memberId)}
                        className="ml-1 hover:bg-background rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleMember(user.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(user.id)}
                      onCheckedChange={() => toggleMember(user.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddMembers}>
              Thêm {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Group Confirmation */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn rời khỏi nhóm "{room.name}"? Bạn sẽ không thể xem tin nhắn hoặc tham gia cuộc trò chuyện cho đến khi được thêm lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLeaveGroup}
            >
              Rời nhóm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
