"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTaskCard() {
  return (
    <Card className="group relative">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonProjectCard() {
  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute left-0 top-0 h-1 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
