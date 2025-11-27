"use client";

import { SkeletonChatList, SkeletonMessageList } from "@/components/ui/skeleton-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <Card className="w-80 flex-shrink-0 overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SkeletonChatList items={8} />
          </div>
        </div>
      </Card>

      {/* Main Chat */}
      <Card className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SkeletonMessageList items={6} />
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
