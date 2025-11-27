"use client"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

/**
 * Hook to observe element visibility using Intersection Observer
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // If already visible and frozen, don't observe
    if (freezeOnceVisible && isIntersecting) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry?.isIntersecting ?? false
        setIsIntersecting(isElementIntersecting)

        // Unobserve if frozen and now visible
        if (freezeOnceVisible && isElementIntersecting) {
          observer.unobserve(element)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, isIntersecting])

  return [elementRef, isIntersecting]
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoad() {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin: "50px",
    freezeOnceVisible: true,
  })

  return { ref, isVisible }
}
