"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      className={cn("rounded-md bg-muted", className)}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b py-4">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  )
}

export function KanbanCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}
