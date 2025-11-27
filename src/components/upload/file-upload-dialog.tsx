"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUploader } from "./file-uploader"
import { Upload } from "lucide-react"

interface FileUploadDialogProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  multiple?: boolean
  compressImages?: boolean
  onUploadComplete?: (files: File[]) => void
  onUploadError?: (error: string) => void
}

export function FileUploadDialog({
  trigger,
  title = "Tải file lên",
  description = "Chọn hoặc kéo thả file vào đây",
  accept,
  maxSize,
  maxFiles,
  multiple,
  compressImages,
  onUploadComplete,
  onUploadError,
}: FileUploadDialogProps) {
  const [open, setOpen] = useState(false)

  const handleUploadComplete = (files: File[]) => {
    if (onUploadComplete) {
      onUploadComplete(files)
    }
    // Close dialog after successful upload
    setTimeout(() => {
      setOpen(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Tải file lên
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FileUploader
          accept={accept}
          maxSize={maxSize}
          maxFiles={maxFiles}
          multiple={multiple}
          compressImages={compressImages}
          onUploadComplete={handleUploadComplete}
          onUploadError={onUploadError}
        />
      </DialogContent>
    </Dialog>
  )
}
