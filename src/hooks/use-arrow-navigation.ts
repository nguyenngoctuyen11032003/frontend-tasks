"use client"

import { useEffect, useRef } from "react"

interface UseArrowNavigationOptions {
  enabled?: boolean
  orientation?: "vertical" | "horizontal" | "both"
  loop?: boolean
  onNavigate?: (index: number) => void
}

export function useArrowNavigation({
  enabled = true,
  orientation = "vertical",
  loop = true,
  onNavigate,
}: UseArrowNavigationOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]:not([disabled])',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.querySelectorAll(focusableSelectors))
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const elements = getFocusableElements()
      if (elements.length === 0) return

      // Find current focused element index
      const currentIndex = elements.findIndex((el) => el === document.activeElement)
      currentIndexRef.current = currentIndex >= 0 ? currentIndex : 0

      let nextIndex = currentIndexRef.current

      // Handle arrow key navigation
      const isVertical = orientation === "vertical" || orientation === "both"
      const isHorizontal = orientation === "horizontal" || orientation === "both"

      if ((event.key === "ArrowDown" && isVertical) || (event.key === "ArrowRight" && isHorizontal)) {
        event.preventDefault()
        nextIndex = currentIndexRef.current + 1
        if (nextIndex >= elements.length) {
          nextIndex = loop ? 0 : elements.length - 1
        }
      } else if ((event.key === "ArrowUp" && isVertical) || (event.key === "ArrowLeft" && isHorizontal)) {
        event.preventDefault()
        nextIndex = currentIndexRef.current - 1
        if (nextIndex < 0) {
          nextIndex = loop ? elements.length - 1 : 0
        }
      } else if (event.key === "Home") {
        event.preventDefault()
        nextIndex = 0
      } else if (event.key === "End") {
        event.preventDefault()
        nextIndex = elements.length - 1
      }

      // Focus the next element
      if (nextIndex !== currentIndexRef.current) {
        elements[nextIndex]?.focus()
        currentIndexRef.current = nextIndex
        onNavigate?.(nextIndex)
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, orientation, loop, onNavigate])

  return containerRef
}
