"use client"

import { useEffect, useState } from "react"

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

/**
 * Hook to detect current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("md")

  useEffect(() => {
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth
      if (width >= breakpoints["2xl"]) return "2xl"
      if (width >= breakpoints.xl) return "xl"
      if (width >= breakpoints.lg) return "lg"
      if (width >= breakpoints.md) return "md"
      return "sm"
    }

    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    // Set initial breakpoint
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to check if screen size is above a breakpoint
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

/**
 * Hook to check if mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)")
}

/**
 * Hook to check if tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

/**
 * Hook to check if desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)")
}
