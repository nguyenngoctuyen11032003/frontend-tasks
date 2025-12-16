"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token")
      const userParam = searchParams.get("user")
      const redirectParam = searchParams.get("redirect")

      if (!token || !userParam) {
        toast.error("Đăng nhập thất bại", {
          description: "Không nhận được thông tin xác thực"
        })
        router.push("/login")
        return
      }

      try {
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam))

        // Save to store - IMPORTANT: Wait for zustand to persist before redirecting
        setToken(token)
        setUser(user)

        // Determine redirect path based on role
        let redirectPath = redirectParam || "/dashboard"

        // If no explicit redirect, determine by role
        if (!redirectParam) {
          const roles = user.roles || []
          if (roles.includes("super_admin") || roles.includes("admin")) {
            redirectPath = "/admin"
          } else if (roles.includes("manager")) {
            redirectPath = "/projects"
          } else if (roles.includes("member")) {
            redirectPath = "/tasks"
          }
        }

        // Give zustand time to persist state to localStorage
        // This is important for middleware to detect auth state
        setTimeout(() => {
          toast.success("Đăng nhập thành công!", {
            description: `Chào mừng ${user.name}!`
          })
          router.push(redirectPath)
        }, 500)
      } catch (error) {
        console.error("Auth callback error:", error)
        toast.error("Đăng nhập thất bại", {
          description: "Có lỗi xảy ra khi xử lý thông tin đăng nhập"
        })
        router.push("/login")
      }
    }

    handleCallback()
  }, [searchParams, router, setUser, setToken])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Đang xử lý đăng nhập...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
