"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Mail, User, Shield, Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface InviteInfo {
  email: string
  inviterName: string
  roles: Array<{ id: string; name: string; displayName: string }>
}

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Token lời mời không hợp lệ")
      setLoading(false)
      return
    }

    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      const inviteData = await api.verifyInviteToken(token!)
      setInviteInfo(inviteData)
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Token không hợp lệ hoặc đã hết hạn"
      setError(errorMessage)
      toast.error("Xác thực thất bại", { description: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ tên")
      return false
    }

    if (name.trim().length < 2) {
      toast.error("Họ tên phải có ít nhất 2 ký tự")
      return false
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return false
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ (10-11 chữ số)")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      await api.acceptInvite({
        token: token!,
        password,
        name,
        phone: phone || undefined,
      })

      toast.success("🎉 Tài khoản đã được tạo thành công!", {
        description: "Bạn sẽ được chuyển đến trang đăng nhập sau 2 giây",
        duration: 2000,
      })

      setTimeout(() => {
        router.push("/login?from=invite")
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo tài khoản"
      toast.error("Có lỗi xảy ra", { description: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Đang xác thực lời mời...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center">Lời mời không hợp lệ</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/login")} variant="outline">
              Quay lại đăng nhập
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!inviteInfo) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-center">Kích hoạt tài khoản</CardTitle>
          <CardDescription className="text-center">
            Thiết lập mật khẩu để hoàn tất
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Invite Info */}
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email tài khoản</p>
                  <p className="text-base font-semibold text-blue-700 dark:text-blue-400">{inviteInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Người mời</p>
                  <p className="text-base font-semibold text-green-700 dark:text-green-400">{inviteInfo.inviterName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inviteInfo.roles.map((role, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                      >
                        {role.displayName || role.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Họ tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
                autoComplete="name"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
                autoComplete="tel"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Tùy chọn - 10-11 chữ số</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={submitting}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Độ mạnh: {password.length === 0 ? 'Chưa nhập' : password.length < 6 ? 'Yếu' : password.length < 10 ? 'Trung bình' : 'Mạnh'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={submitting}
                  autoComplete="new-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                  {password === confirmPassword ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold" 
              disabled={submitting || !name || password.length < 6 || password !== confirmPassword}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Tạo tài khoản
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => router.push("/login")}
            disabled={submitting}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
