import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Chart Loading Skeleton Component
 * Provides a placeholder skeleton while chart data is loading
 */
export const ChartLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="mt-2 h-4 w-48 bg-muted/60 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-[280px] bg-muted animate-pulse rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

/**
 * Stat Card Loading Skeleton Component
 */
export const StatCardLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
              </div>
              <div className="h-12 w-12 bg-muted animate-pulse rounded-xl ml-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

/**
 * Table Loading Skeleton Component
 */
export const TableLoadingSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 h-10 bg-muted animate-pulse rounded"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
