import { useMemo, useCallback } from "react"

/**
 * Performance optimization hooks
 */

/**
 * Memoize expensive calculations
 * @example
 * const sortedItems = useMemoizedValue(() => items.sort(...), [items])
 */
export function useMemoizedValue<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps)
}

/**
 * Memoize callback functions to prevent unnecessary re-renders
 * @example
 * const handleClick = useMemoizedCallback((id) => { ... }, [])
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T
}

/**
 * Debounce hook for performance-sensitive operations
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300)
 */
import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook for limiting function calls
 * @example
 * const throttledScroll = useThrottle(handleScroll, 100)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [ready, setReady] = useState(true)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!ready) return

      callback(...args)
      setReady(false)

      setTimeout(() => {
        setReady(true)
      }, delay)
    },
    [ready, callback, delay]
  ) as T

  return throttledCallback
}

/**
 * Intersection observer hook for lazy loading
 * @example
 * const { ref, inView } = useInView({ threshold: 0.5 })
 */
import { useRef } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
}

export function useInView({ threshold = 0, rootMargin = "0px" }: UseInViewOptions = {}) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { threshold, rootMargin }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin])

  return { ref, inView }
}

/**
 * Virtual scrolling hook for long lists
 * @example
 * const { visibleItems, containerProps, itemProps } = useVirtualScroll({
 *   items: allItems,
 *   itemHeight: 50,
 *   containerHeight: 500,
 * })
 */
interface UseVirtualScrollOptions<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualScrollOptions<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = useMemo(
    () =>
      items.slice(visibleStart, visibleEnd).map((item, index) => ({
        item,
        index: visibleStart + index,
      })),
    [items, visibleStart, visibleEnd]
  )

  const totalHeight = items.length * itemHeight

  const containerProps = {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
    style: {
      height: containerHeight,
      overflow: "auto" as const,
    },
  }

  const itemProps = (index: number) => ({
    style: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: itemHeight,
      transform: `translateY(${index * itemHeight}px)`,
    },
  })

  return {
    visibleItems,
    containerProps,
    itemProps,
    totalHeight,
  }
}
