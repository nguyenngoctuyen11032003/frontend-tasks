/**
 * Performance optimization utilities
 */

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy load images with Intersection Observer
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement
          const src = imgElement.dataset.src
          if (src) {
            imgElement.src = src
            imgElement.removeAttribute("data-src")
            observer.unobserve(imgElement)
          }
        }
      })
    },
    {
      rootMargin: "50px",
    }
  )

  observer.observe(img)
}

// Measure performance
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== "undefined" && window.performance) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
  } else {
    fn()
  }
}

// Check if we should enable performance monitoring
export function shouldEnablePerformanceMonitoring(): boolean {
  if (typeof window === "undefined") return false
  
  // Only enable in development or with explicit flag
  return (
    process.env.NODE_ENV === "development" ||
    localStorage.getItem("enable_performance_monitoring") === "true"
  )
}

// Web Vitals monitoring
export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
}

export function reportWebVitals(metric: WebVitalsMetric) {
  if (!shouldEnablePerformanceMonitoring()) return

  console.log(
    `📊 ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`
  )

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // Example: send to analytics service
    // analytics.track('web_vital', metric)
  }
}

// Memory usage monitoring
export function checkMemoryUsage() {
  if (typeof window === "undefined") return null
  
  const memory = (performance as any).memory
  if (!memory) return null

  const usedMB = memory.usedJSHeapSize / 1048576
  const limitMB = memory.jsHeapSizeLimit / 1048576
  const percentage = (usedMB / limitMB) * 100

  return {
    used: usedMB.toFixed(2),
    limit: limitMB.toFixed(2),
    percentage: percentage.toFixed(2),
  }
}

// Request idle callback wrapper
export function requestIdleTask(callback: () => void, timeout = 2000) {
  if (typeof window === "undefined") return

  if ("requestIdleCallback" in window) {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 1)
  }
}

// Preload resources
export function preloadResource(href: string, as: string) {
  if (typeof document === "undefined") return

  const link = document.createElement("link")
  link.rel = "preload"
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Prefetch routes
export function prefetchRoute(href: string) {
  if (typeof document === "undefined") return

  const link = document.createElement("link")
  link.rel = "prefetch"
  link.href = href
  document.head.appendChild(link)
}
