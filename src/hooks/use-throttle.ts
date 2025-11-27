"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Throttle hook - limits how often value updates
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 500
): (...args: Parameters<T>) => void {
  const lastRan = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastRan.current >= limit) {
      callback(...args)
      lastRan.current = now
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRan.current = Date.now()
      }, limit - (now - lastRan.current))
    }
  }
}
