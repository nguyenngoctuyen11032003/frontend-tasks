/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useCallback } from "react"
import { Trash2, FileIcon, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import useUploadStore from "@/stores/upload-store"
import type { Attachment } from "@/types"

/**
 * Props for FileUploadField component
 * 
 * @interface FileUploadFieldProps
 * @property {string} entityType - Type of entity (task, project, note, chat)
 * @property {string} entityId - ID of the entity for associating uploads
 * @property {(files: Attachment[]) => void} [onFilesUpload] - Callback on successful upload
 * @property {number} [maxFiles=5] - Maximum number of files per upload session
 * @property {number} [maxFileSize=10] - Maximum file size in MB
 * @property {string[]} [acceptedTypes] - File MIME types or extensions accepted
 */
interface FileUploadFieldProps {
  entityType: string
  entityId: string
  onFilesUpload?: (files: Attachment[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
}

/**
 * FileUploadField Component
 * 
 * Reusable file upload component with:
 * - Drag-drop support via react-dropzone
 * - Progress tracking per file
 * - Batch upload to /upload/files endpoint
 * - File list with download and delete actions
 * - File type and size validation
 * - Entity-scoped file management
 * 
 * @example
 * ```tsx
 * <FileUploadField 
 *   entityType="task"
 *   entityId={taskId}
 *   onFilesUpload={(files) => console.log(files)}
 *   maxFiles={5}
 *   maxFileSize={10}
 * />
 * ```
 */
export function FileUploadField({
  entityType,
  entityId,
  onFilesUpload,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ["image/*", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
}: FileUploadFieldProps) {
  const [showUploadArea, setShowUploadArea] = useState(false)

  // Use upload store
  const uploadedFiles = useUploadStore((state) => state.uploadedFiles)
  const uploadingFiles = useUploadStore((state) => state.uploadingFiles)
  const loading = useUploadStore((state) => state.loading)
  const error = useUploadStore((state) => state.error)
  const uploadMultipleFiles = useUploadStore((state) => state.uploadMultipleFiles)
  const deleteFile = useUploadStore((state) => state.deleteFile)

  // Filter uploaded files for current entity
  const entityFiles = uploadedFiles.filter(
    (f) => f.type === entityType || entityType === "all"
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error("Vui lòng chọn file")
        return
      }

      if (acceptedFiles.length > maxFiles) {
        toast.error(`Tối đa ${maxFiles} file`)
        return
      }

      // Validate file sizes
      const invalidFiles = acceptedFiles.filter((f) => f.size > maxFileSize * 1024 * 1024)
      if (invalidFiles.length > 0) {
        toast.error(`Kích thước file không được vượt quá ${maxFileSize}MB`)
        return
      }

      try {
        await uploadMultipleFiles(acceptedFiles, entityType, entityId)
        toast.success(`Tải lên ${acceptedFiles.length} file thành công`)
        onFilesUpload?.(acceptedFiles.map((f) => ({ name: f.name } as Attachment)))
        setShowUploadArea(false)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Lỗi khi tải lên file"
        toast.error(errorMsg)
      }
    },
    [entityType, entityId, maxFiles, maxFileSize, uploadMultipleFiles, onFilesUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
    maxFiles,
    multiple: true,
  })

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId)
      toast.success("Xóa file thành công")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi khi xóa file"
      toast.error(errorMsg)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()

    if (!ext) return <FileIcon className="h-4 w-4" />

    // Image extensions
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return <img src="" alt="" className="h-4 w-4 object-cover" />
    }

    // PDF
    if (ext === "pdf") return <FileIcon className="h-4 w-4 text-red-600" />

    // Document
    if (["doc", "docx", "txt"].includes(ext)) return <FileIcon className="h-4 w-4 text-blue-600" />

    // Spreadsheet
    if (["xls", "xlsx", "csv"].includes(ext)) return <FileIcon className="h-4 w-4 text-green-600" />

    return <FileIcon className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {!showUploadArea && (
        <Button
          variant="outline"
          onClick={() => setShowUploadArea(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <FileIcon className="h-4 w-4 mr-2" />
              Thêm file đính kèm
            </>
          )}
        </Button>
      )}

      {/* Upload Area */}
      {showUploadArea && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary hover:bg-accent"
          )}
        >
          <input {...getInputProps()} />
          <FileIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? "Thả file vào đây" : "Kéo thả file hoặc nhấn để chọn"}
          </p>
          <p className="text-xs text-muted-foreground">
            Tối đa {maxFiles} file, mỗi file {maxFileSize}MB
          </p>

          {/* Close Upload Area */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowUploadArea(false)
            }}
            className="mt-4"
          >
            Đóng
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Đang tải lên:</p>
          {Array.from(uploadingFiles.entries()).map(([id, file]) => (
            <div key={id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{file.progress}%</span>
              </div>
              <Progress value={file.progress} />
              {file.error && (
                <p className="text-xs text-red-600 dark:text-red-200">{file.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {entityFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">File đã tải lên:</p>
          <div className="space-y-2">
            {entityFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 p-3 rounded-md border bg-card"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file.name)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a href={file.url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
