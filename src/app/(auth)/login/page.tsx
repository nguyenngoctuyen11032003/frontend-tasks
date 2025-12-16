"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Call backend API directly to get auth-callback redirect URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Đăng nhập thất bại')
      }

      const result = await response.json()
      
      // The backend should return a redirect URL or token+user
      if (result.redirectUrl) {
        // Backend sends auth-callback URL, use it
        window.location.href = result.redirectUrl
      } else if (result.accessToken && result.user) {
        // Fallback: Create auth-callback URL manually
        const callbackUrl = `/auth-callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`
        window.location.href = callbackUrl
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ')
      }
    } catch (error: unknown) {
      // Check if account is locked
      const errorMessage = error instanceof Error ? error.message : "Email hoặc mật khẩu không đúng"
      const isLocked = errorMessage.toLowerCase().includes("khóa") || 
                       errorMessage.toLowerCase().includes("locked")
      
      if (isLocked) {
        toast.error("🔒 Tài khoản bị khóa", {
          description: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
          duration: 5000,
        })
      } else {
        toast.error("Đăng nhập thất bại", {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md text-center text-primary-foreground"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
              <span className="text-3xl font-bold">TM</span>
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold">TaskMaster</h1>
          <p className="text-lg opacity-90">Quản lý công việc thông minh, tăng hiệu suất làm việc nhóm của bạn</p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-sm">
            <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur">
              <div className="mb-2 text-2xl font-bold">500+</div>
              <div className="opacity-80">Dự án</div>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur">
              <div className="mb-2 text-2xl font-bold">10k+</div>
              <div className="opacity-80">Công việc</div>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur">
              <div className="mb-2 text-2xl font-bold">99%</div>
              <div className="opacity-80">Hài lòng</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">TM</span>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold">Đăng nhập</h2>
            <p className="mt-2 text-muted-foreground">Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Hoặc đăng nhập với</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => {
                // Redirect to backend Google OAuth
                window.location.href = 'http://localhost:3001/api/auth/google'
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
