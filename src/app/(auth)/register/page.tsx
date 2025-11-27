"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (!formData.agreeTerms) {
      toast.error("Vui lòng đồng ý với điều khoản sử dụng")
      return
    }

    // Handle registration logic here
    toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center space-y-6 p-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskMaster
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Bắt đầu hành trình quản lý công việc
            </h2>
            <p className="text-lg text-muted-foreground">
              Tham gia cùng hàng nghìn người dùng đang tin tưởng TaskMaster để quản lý dự án và công việc hiệu quả hơn.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "✨",
                title: "Quản lý dự án thông minh",
                desc: "Theo dõi tiến độ và phân công công việc dễ dàng",
              },
              {
                icon: "🚀",
                title: "Cộng tác nhóm hiệu quả",
                desc: "Giao tiếp và làm việc nhóm mượt mà",
              },
              {
                icon: "📊",
                title: "Báo cáo chi tiết",
                desc: "Phân tích hiệu suất và đưa ra quyết định đúng đắn",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
              <CardDescription>Điền thông tin để bắt đầu sử dụng TaskMaster</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0123456789"
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tôi đồng ý với{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      điều khoản sử dụng
                    </Link>{" "}
                    và{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      chính sách bảo mật
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Tạo tài khoản
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-muted-foreground">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
