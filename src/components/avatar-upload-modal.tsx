"use client"

import { useState, useCallback } from "react"
import Cropper, { Area } from "react-easy-crop"
import { Upload, RotateCw, Check, X, Loader2, ZoomOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"
import imageCompression from "browser-image-compression"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import useUploadStore from "@/stores/upload-store"

/**
 * Props for AvatarUploadModal component
 * 
 * @interface AvatarUploadModalProps
 * @property {boolean} open - Whether modal is open
 * @property {() => void} onClose - Callback to close modal
 * @property {string} [currentAvatar] - Current user avatar URL (for display)
 * @property {(avatarUrl: string) => void} [onSuccess] - Callback with new avatar URL
 */
interface AvatarUploadModalProps {
  open: boolean
  onClose: () => void
  currentAvatar?: string
  onSuccess?: (avatarUrl: string) => void
}

/**
 * Avatar Upload Modal Component
 * 
 * Features:
 * - Image selection via file picker or drag-drop
 * - Interactive crop with zoom and rotation
 * - Image compression (browser-side) before upload
 * - Progress tracking during upload
 * - Error handling with user-friendly messages
 * - Integrates with upload-store for state management
 * 
 * Image Flow:
 * 1. User selects/drops image
 * 2. Display crop preview (react-easy-crop)
 * 3. User adjusts crop area, zoom, rotation
 * 4. On upload: compress image (browser-image-compression)
 * 5. Send to /upload/avatar endpoint
 * 6. Update avatar URL in profile
 * 
 * @example
 * ```tsx
 * <AvatarUploadModal 
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   currentAvatar={user.avatarUrl}
 *   onSuccess={(url) => updateUser({avatar: url})}
 * />
 * ```
 */
export function AvatarUploadModal({
  open,
  onClose,
  currentAvatar,
  onSuccess,
}: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [localProgress, setLocalProgress] = useState(0)

  // Use upload store
  const uploadAvatar = useUploadStore((state) => state.uploadAvatar)
  const uploading = useUploadStore((state) => state.loading)
  const uploadError = useUploadStore((state) => state.error)

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, "image/jpeg")
    })
  }

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setLocalProgress(0)

    try {
      // Crop image
      setLocalProgress(25)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

      // Compress image
      setLocalProgress(50)
      const compressedBlob = await imageCompression(croppedBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        onProgress: (progress) => {
          setLocalProgress(50 + progress * 0.25)
        },
      })

      // Convert blob to file
      const file = new File([compressedBlob], "avatar.jpg", { type: "image/jpeg" })

      // Upload using store
      setLocalProgress(75)
      const avatarUrl = await uploadAvatar(file)
      setLocalProgress(100)

      toast.success("Cập nhật ảnh đại diện thành công")
      onSuccess?.(avatarUrl)
      handleClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ảnh lên"
      toast.error(errorMessage)
    }
  }

  const handleClose = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setLocalProgress(0)
    onClose()
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tải lên ảnh đại diện</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary hover:bg-accent"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {isDragActive ? "Thả ảnh vào đây" : "Kéo thả ảnh hoặc nhấn để chọn"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP (tối đa 10MB)
              </p>
            </div>
          ) : (
            <>
              {/* Crop Area */}
              <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium flex items-center gap-2">
                      <ZoomOut className="h-4 w-4" />
                      Thu phóng
                    </label>
                    <span className="text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={([value]) => setZoom(value)}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Xoay ảnh</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    disabled={uploading}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    90°
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Đang tải lên...</span>
                      <span className="font-medium">{localProgress}%</span>
                    </div>
                    <Progress value={localProgress} />
                  </div>
                )}

                {/* Error Display */}
                {uploadError && (
                  <div className="p-3 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-200">{uploadError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setImageSrc(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Chọn ảnh khác
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Xác nhận
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
