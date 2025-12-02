"use client"

import { useEffect, useState } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMSW() {
      // Check if MSW is enabled via environment variable
      const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true"
      
      if (process.env.NODE_ENV === "development" && mswEnabled) {
        // Dynamically import MSW to avoid including it in production bundle
        const { worker } = await import("@/mocks/browser")
        
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: "/mockServiceWorker.js",
          },
        })

        console.log("[MSW] Mock Service Worker initialized")
      } else {
        console.log("[MSW] Bypassing MSW - Using real backend API")
      }
      setMswReady(true)
    }

    initMSW()
  }, [])

  // Don't render children until MSW check is complete in development
  if (process.env.NODE_ENV === "development" && !mswReady) {
    return null
  }

  return <>{children}</>
}
