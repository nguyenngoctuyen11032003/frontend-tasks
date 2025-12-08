"use client"

import { useState } from "react"
import { Mail, Send, Paperclip, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import api from "@/lib/api"
import type { User } from "@/types"

interface EmailComposeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipient: User | null
}

export function EmailComposeModal({ open, onOpenChange, recipient }: EmailComposeModalProps) {
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments([...attachments, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSendEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung email")
      return
    }

    if (!recipient) {
      toast.error("Không tìm thấy người nhận")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Send email via API
      await api.sendEmail({
        to: recipient.email,
        subject,
        content: body,
      })
      
      toast.success(`Email đã được gửi đến ${recipient.name}`)
      
      // Reset form
      setSubject("")
      setBody("")
      setAttachments([])
      onOpenChange(false)
    } catch (err) {
      console.error("Error sending email:", err)
      toast.error(err instanceof Error ? err.message : "Lỗi khi gửi email")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (!recipient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Soạn email
          </DialogTitle>
          <DialogDescription>
            Gửi email đến {recipient.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label>Người nhận</Label>
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-accent/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipient.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>{getInitials(recipient.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{recipient.name}</p>
                <p className="text-sm text-muted-foreground truncate">{recipient.email}</p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Tiêu đề</Label>
            <Input
              id="subject"
              placeholder="Nhập tiêu đề email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Nội dung</Label>
            <Textarea
              id="body"
              placeholder="Nhập nội dung email..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tệp đính kèm</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Đính kèm
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileAttach}
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSendEmail} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi email
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
