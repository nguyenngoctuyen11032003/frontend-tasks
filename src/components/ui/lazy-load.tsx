/**
 * Lazy loading wrapper component
 */

"use client"

import { Suspense, lazy, ComponentType } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LazyLoadProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function LazyLoad({ fallback, children }: LazyLoadProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}

/**
 * Helper to create lazy loaded components with custom fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyLoad fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoad>
    )
  }
}
