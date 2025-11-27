/**
 * Image optimization component with lazy loading
 */

"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallback?: string
  aspectRatio?: "square" | "video" | "portrait" | "landscape"
  shimmer?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  aspectRatio,
  shimmer = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  }

  const imageSrc = hasError ? fallback : src

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill={!props.width && !props.height}
        sizes={props.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        className={cn(
          "transition-opacity duration-300",
          isLoading && shimmer && "animate-pulse",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
      {isLoading && shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
      )}
    </div>
  )
}
