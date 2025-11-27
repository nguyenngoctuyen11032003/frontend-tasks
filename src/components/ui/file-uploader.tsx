"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, FileText, FileImage, FileVideo, Music, Archive, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
}

interface FileUploaderProps {
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  onUpload?: (files: File[]) => Promise<void>
  onRemove?: (fileId: string) => void
  disabled?: boolean
  className?: string
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return FileImage
  if (type.startsWith("video/")) return FileVideo
  if (type.startsWith("audio/")) return Music
  if (type.includes("pdf")) return FileText
  if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return Archive
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function FileUploader({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "text/plain": [".txt"],
  },
  onUpload,
  onRemove,
  disabled = false,
  className,
}: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      rejectedFiles.forEach((rejected) => {
        const errors = rejected.errors.map((e: any) => e.message).join(", ")
        toast.error(`${rejected.file.name}: ${errors}`)
      })

      // Check max files limit
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        toast.error(`Chỉ có thể tải lên tối đa ${maxFiles} file`)
        return
      }

      // Add files to state with initial progress
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: "uploading" as const,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Simulate upload progress and call onUpload
      if (onUpload) {
        try {
          // Simulate progress for each file
          for (const uploadedFile of newFiles) {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === uploadedFile.id && f.progress < 90
                    ? { ...f, progress: f.progress + 10 }
                    : f
                )
              )
            }, 200)

            // Wait for progress simulation
            await new Promise((resolve) => setTimeout(resolve, 2000))
            clearInterval(progressInterval)

            // Mark as complete
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, progress: 100, status: "success" as const }
                  : f
              )
            )
          }

          // Call the actual upload handler
          await onUpload(acceptedFiles)
          toast.success(`Đã tải lên ${acceptedFiles.length} file`)
        } catch (error) {
          // Mark files as error
          newFiles.forEach((uploadedFile) => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, status: "error" as const, error: "Upload failed" }
                  : f
              )
            )
          })
          toast.error("Không thể tải lên file")
        }
      } else {
        // If no onUpload handler, just mark as success
        newFiles.forEach((uploadedFile) => {
          setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, progress: 100, status: "success" as const }
                  : f
              )
            )
          }, 2000)
        })
      }
    },
    [uploadedFiles, maxFiles, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled: disabled || uploadedFiles.length >= maxFiles,
  })

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    onRemove?.(fileId)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          disabled || uploadedFiles.length >= maxFiles
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-primary hover:bg-accent/50",
          uploadedFiles.length >= maxFiles && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm font-medium">Thả file vào đây...</p>
        ) : (
          <div>
            <p className="text-sm font-medium mb-1">
              Kéo thả file vào đây hoặc click để chọn
            </p>
            <p className="text-xs text-muted-foreground">
              Tối đa {maxFiles} file, mỗi file tối đa {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* Uploaded files list */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file.type)

              return (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {/* File preview/icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                        <FileIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress bar */}
                    {uploadedFile.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={uploadedFile.progress} className="h-1" />
                      </div>
                    )}

                    {/* Error message */}
                    {uploadedFile.status === "error" && uploadedFile.error && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>

                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.status === "uploading" && (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    {uploadedFile.status === "success" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {uploadedFile.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* Remove button */}
                  {uploadedFile.status !== "uploading" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => removeFile(uploadedFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File count */}
      {uploadedFiles.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {uploadedFiles.length} / {maxFiles} file
        </p>
      )}
    </div>
  )
}
