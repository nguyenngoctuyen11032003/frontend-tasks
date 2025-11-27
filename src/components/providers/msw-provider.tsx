"use client"

import { useEffect, useState } from "react"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    async function initMSW() {
      if (process.env.NODE_ENV === "development") {
        // Dynamically import MSW to avoid including it in production bundle
        const { worker } = await import("@/mocks/browser")
        
        await worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: "/mockServiceWorker.js",
          },
        })

        console.log("[MSW] Mock Service Worker initialized")
      }
      setMswReady(true)
    }

    initMSW()
  }, [])

  // Don't render children until MSW is ready in development
  if (process.env.NODE_ENV === "development" && !mswReady) {
    return null
  }

  return <>{children}</>
}
