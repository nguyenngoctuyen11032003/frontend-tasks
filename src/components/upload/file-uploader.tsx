"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import imageCompression from "browser-image-compression"
import {
  Upload,
  File,
  Image as ImageIcon,
  X,
  FileText,
  FileArchive,
  FileVideo,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

interface FileUploaderProps {
  accept?: Record<string, string[]>
  maxSize?: number // in MB
  maxFiles?: number
  multiple?: boolean
  compressImages?: boolean
  onUploadComplete?: (files: File[]) => void
  onUploadError?: (error: string) => void
  className?: string
}

export function FileUploader({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc", ".docx"],
    "application/vnd.ms-excel": [".xls", ".xlsx"],
    "text/*": [".txt", ".csv"],
  },
  maxSize = 10, // 10MB default
  maxFiles = 5,
  multiple = true,
  compressImages = true,
  onUploadComplete,
  onUploadError,
  className,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error("Error compressing image:", error)
      return file
    }
  }

  const simulateUpload = async (file: File, id: string) => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: i } : f))
      )
    }

    // Mark as completed
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "completed" as const } : f))
    )
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((f) => {
          const error = f.errors[0]
          if (error.code === "file-too-large") {
            return `${f.file.name} quá lớn (tối đa ${maxSize}MB)`
          }
          if (error.code === "file-invalid-type") {
            return `${f.file.name} không đúng định dạng`
          }
          return `${f.file.name} không hợp lệ`
        })
        
        toast.error("Lỗi tải lên", {
          description: errors.join(", "),
        })
        
        if (onUploadError) {
          onUploadError(errors.join(", "))
        }
        return
      }

      // Check max files limit
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast.error("Vượt quá số lượng file", {
          description: `Chỉ được tải tối đa ${maxFiles} file`,
        })
        return
      }

      setIsUploading(true)

      try {
        // Process files
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            let processedFile = file

            // Compress images if enabled
            if (compressImages && file.type.startsWith("image/")) {
              processedFile = await compressImage(file)
            }

            const id = Math.random().toString(36).substring(7)
            const preview = file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined

            return {
              id,
              file: processedFile,
              preview,
              progress: 0,
              status: "uploading" as const,
            }
          })
        )

        // Add to uploaded files
        setUploadedFiles((prev) => [...prev, ...processedFiles])

        // Simulate upload for each file
        await Promise.all(
          processedFiles.map((f) => simulateUpload(f.file, f.id))
        )

        toast.success("Tải lên thành công", {
          description: `${acceptedFiles.length} file đã được tải lên`,
        })

        if (onUploadComplete) {
          onUploadComplete(processedFiles.map((f) => f.file))
        }
      } catch (error) {
        toast.error("Lỗi tải lên", {
          description: "Có lỗi xảy ra khi tải file",
        })
        
        if (onUploadError) {
          onUploadError("Upload failed")
        }
      } finally {
        setIsUploading(false)
      }
    },
    [uploadedFiles, maxFiles, maxSize, compressImages, onUploadComplete, onUploadError]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple,
    disabled: isUploading,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    if (fileType.startsWith("video/")) return <FileVideo className="h-8 w-8" />
    if (fileType.startsWith("audio/")) return <FileAudio className="h-8 w-8" />
    if (fileType === "application/pdf") return <FileText className="h-8 w-8" />
    if (fileType.includes("zip") || fileType.includes("archive"))
      return <FileArchive className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload
            className={cn(
              "h-10 w-10 text-muted-foreground",
              isDragActive && "text-primary"
            )}
          />
          <div>
            <p className="font-medium">
              {isDragActive
                ? "Thả file vào đây"
                : "Kéo thả file hoặc click để chọn"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tối đa {maxFiles} file, mỗi file không quá {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {/* Preview/Icon */}
                <div className="shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-muted-foreground">
                      {getFileIcon(uploadedFile.file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Status Icon */}
                <div className="shrink-0">
                  {uploadedFile.status === "uploading" && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {uploadedFile.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {uploadedFile.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => removeFile(uploadedFile.id)}
                  disabled={uploadedFile.status === "uploading"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {uploadedFiles.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {uploadedFiles.filter((f) => f.status === "completed").length} /{" "}
            {uploadedFiles.length} hoàn thành
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUploadedFiles([])}
            disabled={isUploading}
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  )
}
