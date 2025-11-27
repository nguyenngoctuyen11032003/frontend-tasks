"use client";

import { SkeletonTaskCard } from "@/components/ui/skeleton-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: colIndex === 0 ? 3 : colIndex === 1 ? 2 : colIndex === 2 ? 1 : 2 }).map((_, i) => (
                <SkeletonTaskCard key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
