"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, CheckCheck, File, Download, ImageIcon as ImageIconLucide } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { mockRoleDefinitions } from "@/mocks/data"
import { cn, formatTime } from "@/lib/utils"
import type { Message, User } from "@/types"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  users: User[]
  expandedMessages: Set<string>
  onToggleExpand: (messageId: string) => void
  className?: string
}

export function MessageList({
  messages,
  currentUserId,
  users,
  expandedMessages,
  onToggleExpand,
  className,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getUserRoleColor = (user: User | undefined) => {
    if (!user || !user.roles || user.roles.length === 0) return undefined
    const primaryRole = user.roles[0]
    const roleDefinition = mockRoleDefinitions.find(r => r.name === primaryRole)
    return roleDefinition?.color
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={cn("space-y-4", className)}>
      {messages?.map((message, index) => {
        // Skip undefined messages
        if (!message || !message.id) return null

        const isOwn = message.sender?.id === currentUserId
        const sender = message.sender
        const showDate =
          index === 0 || formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt)
        const isExpanded = expandedMessages.has(message.id)
        const isLongMessage = message.content.length > 200
        
        // Get file info from attachments
        const fileUrl = message.attachmentUrls?.[0]
        const fileName = fileUrl ? fileUrl.split('/').pop() : null

        return (
          <div key={message.id}>
            {/* Date Separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={sender?.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {sender ? getInitials(sender.name) : "?"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={cn("max-w-[70%] min-w-0 flex flex-col", isOwn ? "items-end" : "items-start")}>
                {!isOwn && sender && (
                  <span 
                    className="text-xs font-medium mb-1 px-2"
                    style={{ color: getUserRoleColor(sender) || 'inherit' }}
                  >
                    {sender.name}
                  </span>
                )}

                {/* Text Message */}
                {message.type === "text" && (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 break-words",
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                      isLongMessage && "cursor-pointer hover:opacity-90 transition-opacity"
                    )}
                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    onClick={() => isLongMessage && onToggleExpand(message.id)}
                  >
                    <p 
                      className={cn("text-sm whitespace-pre-wrap break-words", !isExpanded && isLongMessage && "line-clamp-3")}
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {message.content}
                    </p>
                    {isLongMessage && (
                      <button
                        className={cn(
                          "text-xs mt-1 underline",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleExpand(message.id)
                        }}
                      >
                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                      </button>
                    )}
                    <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
                      <span className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn &&
                        (message.readBy && message.readBy.length > 1 ? (
                          <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="h-3 w-3 text-primary-foreground/70" />
                        ))}
                    </div>
                  </div>
                )}

                {/* Image Message */}
                {message.type === "image" && fileUrl && (
                  <div
                    className={cn(
                      "rounded-2xl overflow-hidden",
                      isOwn ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <img
                      src={fileUrl}
                      alt="Shared image"
                      className="max-w-xs max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(fileUrl, "_blank")}
                    />
                    {message.content && (
                      <div className="p-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                    <div className={cn("flex items-center gap-1 px-3 pb-2", isOwn ? "justify-end" : "justify-start")}>
                      <span className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn &&
                        (message.readBy && message.readBy.length > 1 ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        ))}
                    </div>
                  </div>
                )}

                {/* File Message */}
                {message.type === "file" && fileUrl && (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 flex items-center gap-3",
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isOwn ? "bg-primary-foreground/10" : "bg-background"
                    )}>
                      <File className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileName || "File"}</p>
                      <div className={cn("flex items-center gap-1 mt-1")}>
                        <span className={cn("text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwn &&
                          (message.readBy && message.readBy.length > 1 ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          ))}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn("h-8 w-8", isOwn && "hover:bg-primary-foreground/10")}
                      onClick={() => window.open(fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
