"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import ChatPage from "./page"

export default function ChatPageWrapper() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Redirect to login if not authenticated
      router.push("/login")
    } else {
      setIsReady(true)
    }
  }, [isAuthenticated, user, router])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return <ChatPage />
}
