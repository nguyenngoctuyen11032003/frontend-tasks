"use client"

import { useEffect, useRef } from "react"

type Politeness = "polite" | "assertive"

interface AnnounceOptions {
  politeness?: Politeness
  delay?: number
}

export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create screen reader announcement container if it doesn't exist
    if (!announceRef.current) {
      const container = document.createElement("div")
      container.id = "sr-announcer"
      container.setAttribute("role", "status")
      container.setAttribute("aria-live", "polite")
      container.setAttribute("aria-atomic", "true")
      container.className = "sr-only"
      container.style.cssText =
        "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"
      document.body.appendChild(container)
      announceRef.current = container
    }

    return () => {
      if (announceRef.current && document.body.contains(announceRef.current)) {
        document.body.removeChild(announceRef.current)
        announceRef.current = null
      }
    }
  }, [])

  const announce = (message: string, options: AnnounceOptions = {}) => {
    const { politeness = "polite", delay = 100 } = options

    if (!announceRef.current) return

    const container = announceRef.current
    container.setAttribute("aria-live", politeness)

    // Clear previous message
    container.textContent = ""

    // Set new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      container.textContent = message
    }, delay)

    // Clear the message after a few seconds
    setTimeout(() => {
      container.textContent = ""
    }, delay + 3000)
  }

  return { announce }
}

// Hook for announcing route changes
export function useRouteAnnouncer() {
  const { announce } = useAnnounce()

  const announceRoute = (routeName: string) => {
    announce(`Đã chuyển đến ${routeName}`, { politeness: "polite" })
  }

  return { announceRoute }
}
