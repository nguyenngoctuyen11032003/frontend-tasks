"use client"

import { useState, useRef } from "react"
import { Send, Paperclip, ImageIcon, Smile, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ChatInputProps {
  onSendMessage: (content: string, type?: "text" | "image" | "file", file?: File) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
  className,
}: ChatInputProps) {
  const [messageText, setMessageText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (selectedFile) {
      const type = selectedFile.type.startsWith("image/") ? "image" : "file"
      onSendMessage(messageText, type, selectedFile)
      clearFileSelection()
    } else if (messageText.trim()) {
      onSendMessage(messageText, "text")
    }
    setMessageText("")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
      toast.success(`Đã chọn file: ${file.name}`)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh")
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      toast.success(`Đã chọn ảnh: ${file.name}`)
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Emoji data (simplified - in production, use a proper emoji picker library)
  const emojis = ["😀", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✅", "🚀", "⭐", "💪", "🙏"]

  return (
    <div className={cn("space-y-2", className)}>
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
          ) : (
            <div className="h-16 w-16 bg-background rounded flex items-center justify-center">
              <File className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={clearFileSelection}
            className="h-8 w-8 text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={handleImageSelect}
          accept="image/*"
        />

        {/* File attachment button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="hidden sm:inline-flex shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Image attachment button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
          className="hidden sm:inline-flex shrink-0"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <div className="flex-1 min-w-0 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none pr-10"
          />
        </div>

        {/* Emoji picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="hidden sm:inline-flex shrink-0"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessageText(messageText + emoji)
                    textareaRef.current?.focus()
                  }}
                  className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || (!messageText.trim() && !selectedFile)}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground hidden sm:block">
        Nhấn Enter để gửi, Shift + Enter để xuống dòng
      </p>
    </div>
  )
}
