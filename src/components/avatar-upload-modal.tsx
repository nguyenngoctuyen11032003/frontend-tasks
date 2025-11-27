"use client"

import { useState, useCallback, useRef } from "react"
import Cropper, { Area } from "react-easy-crop"
import { Upload, ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"
import imageCompression from "browser-image-compression"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

interface AvatarUploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
  currentAvatar?: string
}

export function AvatarUploadModal({
  open,
  onClose,
  onUpload,
  currentAvatar,
}: AvatarUploadModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Crop image
      setUploadProgress(25)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

      // Compress image
      setUploadProgress(50)
      const compressedBlob = await imageCompression(croppedBlob as File, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        onProgress: (progress) => {
          setUploadProgress(50 + progress * 0.25)
        },
      })

      // Convert blob to file
      const file = new File([compressedBlob], "avatar.jpg", { type: "image/jpeg" })

      // Upload
      setUploadProgress(75)
      await onUpload(file)

      setUploadProgress(100)
      toast.success("Cập nhật ảnh đại diện thành công")
      handleClose()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Có lỗi xảy ra khi tải ảnh lên")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setIsUploading(false)
    setUploadProgress(0)
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
                    disabled={isUploading}
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    90°
                  </Button>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Đang tải lên...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setImageSrc(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Chọn ảnh khác
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  <Check className="h-4 w-4 mr-2" />
                  {isUploading ? "Đang tải..." : "Xác nhận"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
