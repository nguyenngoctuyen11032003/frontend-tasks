"use client"

import { useEffect } from "react"
import { reportWebVitals, type WebVitalsMetric } from "@/lib/performance"

export function WebVitalsReporter() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return

    // Import web-vitals dynamically
    import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const handleMetric = (metric: any) => {
        const { name, value, rating } = metric
        reportWebVitals({
          id: metric.id,
          name,
          value,
          rating: rating || "good",
        } as WebVitalsMetric)
      }

      onCLS(handleMetric)
      onFCP(handleMetric)
      onINP(handleMetric)
      onLCP(handleMetric)
      onTTFB(handleMetric)
    })
  }, [])

  return null
}
