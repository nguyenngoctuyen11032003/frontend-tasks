"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonListProps {
  items?: number;
}

export function SkeletonList({ items = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChatList({ items = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMessageList({ items = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => {
        const isOwn = i % 3 === 0;
        return (
          <div
            key={i}
            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
          >
            <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className={`flex-1 space-y-2 ${isOwn ? "items-end" : ""}`}>
              <Skeleton className={`h-4 w-24 ${isOwn ? "ml-auto" : ""}`} />
              <Skeleton
                className={`h-16 ${isOwn ? "ml-auto w-2/3" : "w-3/4"} rounded-lg`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
