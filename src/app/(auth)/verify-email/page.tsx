"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Token xác thực không hợp lệ")
        return
      }

      try {
        const response = await api.verifyEmail(token)
        setStatus("success")
        setMessage(response.message || "Email đã được xác thực thành công!")
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "Xác thực email thất bại. Token có thể đã hết hạn.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">TM</span>
          </div>
        </div>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold">Đang xác thực email...</h2>
              <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold">Xác thực thành công!</h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
              </p>
            </div>
            <Button onClick={() => router.push("/login")} className="w-full" size="lg">
              Đăng nhập ngay
            </Button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold">Xác thực thất bại</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push("/login")} className="w-full" size="lg">
                Quay lại đăng nhập
              </Button>
              <Button
                onClick={() => router.push("/register")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Đăng ký lại
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
