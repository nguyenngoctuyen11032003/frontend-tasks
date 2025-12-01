"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  ImageIcon,
  Users,
  X,
  UserPlus,
  Hash,
  BellOff,
  Bell,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { GroupInfoSheet } from "@/components/chat/group-info-sheet"
import { mockUsers, mockChatRooms, mockMessages } from "@/mocks/data"
import { convertMockMessages, type MockMessage } from "@/lib/chat"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useSocketMessages, useSocketTyping, useSocketUserStatus } from "@/hooks/use-socket"
import type { ChatRoom, Message } from "@/types"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get("userId")
  
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(mockChatRooms[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>(convertMockMessages(mockMessages as unknown as MockMessage[]))
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [channelName, setChannelName] = useState("")
  const [channelDescription, setChannelDescription] = useState("")
  const [isPublicChannel, setIsPublicChannel] = useState(false)
  const [mutedRooms, setMutedRooms] = useState<Set<string>>(new Set())
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null)
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false)
  
  const currentUserId = "user-1" // Replace with actual user ID from auth - Using user-1 to match mock data

  // Socket hooks for real-time features (with error handling)
  const { onlineUsers } = useSocketUserStatus()
  const { typingUsers = [], startTyping, stopTyping } = useSocketTyping(selectedRoom?.id || "")
  
  // Listen for new messages via socket
  useSocketMessages(selectedRoom?.id || "", (newMessage) => {
    setMessages((prev) => [...prev, newMessage])
  })

  // Handle navigation from team page
  useEffect(() => {
    if (userIdParam) {
      // Find or create direct chat with this user
      const directChat = mockChatRooms.find(
        (room) => room.type === "direct" && room.members.includes(userIdParam) && room.members.includes(currentUserId)
      )
      if (directChat) {
        setSelectedRoom(directChat)
      }
    }
  }, [userIdParam, currentUserId])

  const filteredRooms = mockChatRooms.filter((room) => {
    if (room.type === "direct") {
      const otherUserId = room.members.find((id) => id !== currentUserId)
      const otherUser = mockUsers.find((u) => u.id === otherUserId)
      return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const roomMessages = selectedRoom ? messages.filter((m) => m.chatId === selectedRoom.id) : []

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoomInfo = (room: ChatRoom) => {
    if (room.type === "direct") {
      const otherUserId = room.members.find((id) => id !== currentUserId)
      const otherUser = mockUsers.find((u) => u.id === otherUserId)
      // Check real-time online status from socket
      const isOnline = onlineUsers.includes(otherUserId || "")
      return {
        name: otherUser?.name || "Unknown",
        avatar: otherUser?.avatarUrl,
        online: isOnline,
      }
    }
    return {
      name: room.name || "Group Chat",
      avatar: null,
      online: false,
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return "Hôm nay"
    if (d.toDateString() === yesterday.toDateString()) return "Hôm qua"
    return d.toLocaleDateString("vi-VN")
  }

  const handleSendMessage = (content: string, type: "text" | "image" | "file" = "text", file?: File) => {
    if (!selectedRoom) return
    if (!content.trim() && !file) return

    // Stop typing indicator
    stopTyping()

    const currentUser = mockUsers.find((u) => u.id === currentUserId) || mockUsers[0]

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: selectedRoom.id,
      sender: currentUser,
      content,
      type,
      createdAt: new Date().toISOString(),
      readBy: [currentUserId],
      ...(file && {
        attachments: [
          {
            id: `attachment-${Date.now()}`,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file), // In production, upload to server first
            type: file.type,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUser,
          },
        ],
      }),
    }

    setMessages([...messages, newMessage])
    toast.success("Đã gửi tin nhắn")
  }

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm")
      return
    }
    if (selectedMembers.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên")
      return
    }

    // Create new group chat room
    toast.success(`Đã tạo nhóm "${groupName}" với ${selectedMembers.length} thành viên`)
    setIsCreateGroupOpen(false)
    setGroupName("")
    setSelectedMembers([])
    setMemberSearchQuery("")
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const filteredMembersForGroup = mockUsers.filter(
    (user) =>
      user.id !== currentUserId &&
      (user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
  )

  const getRoomTypingUsersNames = (): string => {
    // typingUsers is already a string[] of user IDs in current room
    const names = typingUsers
      .filter((id) => id !== currentUserId)
      .map((id) => mockUsers.find((u) => u.id === id)?.name)
      .filter(Boolean) as string[]
    
    if (names.length === 0) return ""
    if (names.length === 1) return `${names[0]} đang nhập...`
    if (names.length === 2) return `${names[0]} và ${names[1]} đang nhập...`
    return `${names[0]} và ${names.length - 1} người khác đang nhập...`
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-card overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={cn(
        "w-full md:w-80 border-r flex flex-col",
        selectedRoom && "hidden md:flex"
      )}>
        <div className="p-3 md:p-4 border-b">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="font-semibold text-base md:text-lg">Tin nhắn</h2>
            <Button size="icon" variant="ghost" onClick={() => setIsCreateGroupOpen(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.map((room) => {
              const info = getRoomInfo(room)
              const lastMessage = messages
                .filter((m) => m.chatId === room.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    selectedRoom?.id === room.id ? "bg-accent" : "hover:bg-accent/50",
                  )}
                >
                  <div className="relative shrink-0">
                    {room.type === "direct" ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={info.avatar || "/placeholder.svg"} alt={info.name} />
                        <AvatarFallback>{getInitials(info.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {info.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {room.type === "group" && <Hash className="h-3 w-3 text-muted-foreground shrink-0" />}
                        <span className="font-medium truncate text-sm">{info.name}</span>
                        {mutedRooms.has(room.id) && (
                          <BellOff className="h-3 w-3 text-muted-foreground shrink-0" aria-label="Đã tắt thông báo" />
                        )}
                      </div>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground shrink-0">{formatTime(lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lastMessage.sender.id === currentUserId ? "Bạn: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                      {room.unreadCount}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedRoom ? (
        <div className={cn(
          "flex-1 flex flex-col",
          "w-full md:flex"
        )}>
          {/* Chat Header */}
          <div className="p-3 md:p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setSelectedRoom(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              {(() => {
                const info = getRoomInfo(selectedRoom)
                return (
                  <>
                    <div className="relative">
                      {selectedRoom.type === "direct" ? (
                        <Avatar>
                          <AvatarImage src={info.avatar || "/placeholder.svg"} alt={info.name} />
                          <AvatarFallback>{getInitials(info.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hash className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      {info.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {selectedRoom.type === "group" && <Hash className="h-4 w-4 text-muted-foreground" />}
                        {info.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{info.online ? "Đang hoạt động" : "Offline"}</p>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsGroupInfoOpen(true)}>Xem hồ sơ</DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setMutedRooms(prev => {
                        const next = new Set(prev)
                        if (next.has(selectedRoom.id)) {
                          next.delete(selectedRoom.id)
                          toast.success("Đã bật thông báo")
                        } else {
                          next.add(selectedRoom.id)
                          toast.success("Đã tắt thông báo")
                        }
                        return next
                      })
                    }}
                  >
                    {mutedRooms.has(selectedRoom.id) ? (
                      <><Bell className="mr-2 h-4 w-4" />Bật thông báo</>
                    ) : (
                      <><BellOff className="mr-2 h-4 w-4" />Tắt thông báo</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      setRoomToDelete(selectedRoom)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa cuộc trò chuyện
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <MessageList
                messages={roomMessages}
                currentUserId={currentUserId}
                users={mockUsers}
                expandedMessages={expandedMessages}
                onToggleExpand={(messageId) => {
                  setExpandedMessages((prev) => {
                    const next = new Set(prev)
                    if (next.has(messageId)) {
                      next.delete(messageId)
                    } else {
                      next.add(messageId)
                    }
                    return next
                  })
                }}
              />
            
              {/* Typing indicator */}
              {getRoomTypingUsersNames() && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground italic">
                  <div className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </div>
                  <span>{getRoomTypingUsersNames()} đang nhập...</span>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="p-3 md:p-4 border-t">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!selectedRoom}
              placeholder="Nhập tin nhắn..."
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}

      {/* Group Info Sheet */}
      <GroupInfoSheet 
        open={isGroupInfoOpen}
        onOpenChange={setIsGroupInfoOpen}
        room={selectedRoom}
        currentUserId={currentUserId}
      />

      {/* Delete Conversation Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Tất cả tin nhắn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (roomToDelete) {
                  // Remove messages from this room
                  setMessages(prev => prev.filter(m => m.chatId !== roomToDelete.id))
                  // Deselect if this was selected
                  if (selectedRoom?.id === roomToDelete.id) {
                    setSelectedRoom(null)
                  }
                  toast.success("Đã xóa cuộc trò chuyện")
                  setRoomToDelete(null)
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tạo nhóm chat mới
            </DialogTitle>
            <DialogDescription>
              Tạo nhóm để trò chuyện với nhiều người cùng lúc
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="group" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="group">
                <Users className="mr-2 h-4 w-4" />
                Nhóm chat
              </TabsTrigger>
              <TabsTrigger value="channel">
                <Hash className="mr-2 h-4 w-4" />
                Kênh
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="group" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Tên nhóm *</Label>
                <Input
                  id="group-name"
                  placeholder="Nhập tên nhóm..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Thêm thành viên ({selectedMembers.length})</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="pl-9"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Selected Members */}
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
              
              {/* Member List */}
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredMembersForGroup.map((user) => (
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
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          user.status === "online"
                            ? "bg-green-500"
                            : user.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="channel" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel-name">Tên kênh *</Label>
                <Input
                  id="channel-name"
                  placeholder="Nhập tên kênh..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Kênh cho phép nhiều người cùng theo dõi và tham gia thảo luận
                </p>
              </div>

              <div className="space-y-2">
                <Label>Mô tả kênh</Label>
                <Input placeholder="Mô tả ngắn gọn về kênh..." />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">Kênh công khai</p>
                  <p className="text-xs text-muted-foreground">Mọi người có thể tìm và tham gia kênh</p>
                </div>
                <Checkbox defaultChecked />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateGroup}>
              <UserPlus className="mr-2 h-4 w-4" />
              Tạo nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
