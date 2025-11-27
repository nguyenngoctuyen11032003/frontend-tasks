"use client"

import { useEffect, useRef } from "react"

interface UseFocusTrapOptions {
  enabled?: boolean
  onEscape?: () => void
}

export function useFocusTrap({ enabled = true, onEscape }: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.querySelectorAll(focusableSelectors))
    }

    // Focus the first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      // Handle Tab key
      if (event.key === "Tab") {
        const focusableElements = getFocusableElements()
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift+Tab: if on first element, move to last
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab: if on last element, move to first
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
      // Restore focus to the previously focused element
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus()
      }
    }
  }, [enabled, onEscape])

  return containerRef
}
