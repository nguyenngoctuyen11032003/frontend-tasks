"use client"

import { useState, useRef } from "react"
import imageCompression from "browser-image-compression"
import { Camera, Upload, Loader2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AvatarUploaderProps {
  currentAvatar?: string
  fallback?: string
  onUploadComplete?: (file: File, preview: string) => void
  onUploadError?: (error: string) => void
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AvatarUploader({
  currentAvatar,
  fallback = "U",
  onUploadComplete,
  onUploadError,
  size = "lg",
  className,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | undefined>(currentAvatar)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40",
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Lỗi", {
        description: "Vui lòng chọn file ảnh",
      })
      if (onUploadError) {
        onUploadError("Invalid file type")
      }
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Lỗi", {
        description: "Ảnh không được vượt quá 5MB",
      })
      if (onUploadError) {
        onUploadError("File too large")
      }
      return
    }

    setIsUploading(true)

    try {
      // Compress image
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)

      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile)
      setPreview(previewUrl)

      toast.success("Thành công", {
        description: "Ảnh đại diện đã được tải lên",
      })

      if (onUploadComplete) {
        onUploadComplete(compressedFile, previewUrl)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Lỗi", {
        description: "Không thể tải ảnh lên",
      })
      if (onUploadError) {
        onUploadError("Upload failed")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    toast.info("Đã xóa ảnh đại diện")
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], "ring-4 ring-background")}>
          <AvatarImage src={preview} alt="Avatar" />
          <AvatarFallback className="text-2xl">{fallback}</AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        {!isUploading && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-5 w-5" />
          </Button>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Tải ảnh lên
        </Button>

        {preview && preview !== currentAvatar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG hoặc GIF. Tối đa 5MB.
      </p>
    </div>
  )
}
