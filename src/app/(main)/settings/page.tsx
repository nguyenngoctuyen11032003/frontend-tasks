"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  Camera,
  Settings,
  Check,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  Link,
  ExternalLink,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { mockUsers } from "@/mocks/data"
import { useTheme } from "next-themes"
import { AvatarUploadModal } from "@/components/avatar-upload-modal"
import { AvatarUploader } from "@/components/upload"
import { useCustomTheme } from "@/hooks/use-custom-theme"
import { ThemeEditorModal } from "@/components/theme-editor-modal"
import { ThemeManager, themePresets, CustomTheme } from "@/lib/theme"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function SettingsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const { theme, setTheme } = useTheme()
  const currentUser = mockUsers[0]
  const [activeTab, setActiveTab] = useState(tabParam || "profile")
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(currentUser.avatarUrl || "")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    weeklyReport: false,
  })

  // Custom theme management
  const { currentTheme, setTheme: setCustomTheme, customThemes, saveTheme, deleteTheme, resetTheme } = useCustomTheme()
  const [themeEditorOpen, setThemeEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null)

  const allThemes = [...themePresets, ...customThemes]

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const avatarUrl = URL.createObjectURL(file)
      setCurrentAvatar(avatarUrl)

      toast.success("Cập nhật thành công", {
        description: "Ảnh đại diện của bạn đã được cập nhật",
      })

      setAvatarModalOpen(false)
    } catch (error) {
      console.error("Avatar upload error:", error)
      throw error
    }
  }

  // Theme management handlers
  const handleCreateTheme = () => {
    setEditingTheme(undefined)
    setThemeEditorOpen(true)
  }

  const handleEditTheme = (theme: CustomTheme) => {
    setEditingTheme(theme)
    setThemeEditorOpen(true)
  }

  const handleSaveTheme = (theme: CustomTheme) => {
    saveTheme(theme)
  }

  const handleDeleteClick = (themeId: string) => {
    setThemeToDelete(themeId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (themeToDelete) {
      deleteTheme(themeToDelete)
      toast.success("Đã xóa theme", {
        description: "Theme đã được xóa thành công",
      })
      setThemeToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleExportTheme = (theme: CustomTheme) => {
    const json = ThemeManager.exportTheme(theme)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `theme-${theme.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Đã xuất theme", {
      description: `File theme-${theme.id}.json đã được tải xuống`,
    })
  }

  const handleImportTheme = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string
            const theme = ThemeManager.importTheme(json)
            saveTheme(theme)
            toast.success("Đã nhập theme", {
              description: `Theme "${theme.name}" đã được nhập thành công`,
            })
          } catch (error) {
            toast.error("Lỗi nhập theme", {
              description: "File theme không hợp lệ",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleApplyTheme = (theme: CustomTheme) => {
    setCustomTheme(theme.id)
    toast.success("Đã áp dụng theme", {
      description: `Theme "${theme.name}" đã được áp dụng`,
    })
  }

  const handleResetTheme = () => {
    resetTheme()
    toast.success("Đã reset theme", {
      description: "Theme đã được reset về mặc định",
    })
  }

  const isCustomTheme = (themeId: string) => {
    return customThemes.some((t) => t.id === themeId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý tài khoản và tùy chọn của bạn</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Thông báo</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Bảo mật</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Hệ thống</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={currentAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xl">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => setAvatarModalOpen(true)}
                      aria-label="Thay đổi ảnh đại diện"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" defaultValue={currentUser.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={currentUser.email} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" placeholder="Nhập số điện thoại..." />
                  </div>
                </div>



                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liên kết tài khoản</CardTitle>
                <CardDescription>Kết nối với các dịch vụ khác</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Google", connected: true, icon: Globe },
                  { name: "GitHub", connected: false, icon: Globe },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <service.icon className="h-5 w-5" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <Button variant={service.connected ? "outline" : "default"} size="sm">
                      {service.connected ? "Ngắt kết nối" : "Kết nối"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Kênh thông báo
                </h4>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push notification</p>
                      <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Loại thông báo
                </h4>
                <div className="space-y-4 pl-6">
                  {[
                    {
                      key: "taskAssigned",
                      title: "Được giao công việc",
                      desc: "Khi có công việc mới được giao cho bạn",
                    },
                    {
                      key: "taskCompleted",
                      title: "Công việc hoàn thành",
                      desc: "Khi công việc bạn theo dõi được hoàn thành",
                    },
                    {
                      key: "mentions",
                      title: "Được nhắc đến",
                      desc: "Khi ai đó nhắc đến bạn trong bình luận",
                    },
                    {
                      key: "weeklyReport",
                      title: "Báo cáo tuần",
                      desc: "Nhận báo cáo tổng hợp hàng tuần",
                    },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Xác thực hai yếu tố</CardTitle>
                <CardDescription>Thêm lớp bảo mật cho tài khoản của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Ứng dụng xác thực</p>
                      <p className="text-sm text-muted-foreground">Sử dụng Google Authenticator hoặc tương tự</p>
                    </div>
                  </div>
                  <Button variant="outline">Thiết lập</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phiên đăng nhập</CardTitle>
                <CardDescription>Quản lý các thiết bị đang đăng nhập</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { device: "Chrome trên Windows", location: "Hà Nội, Việt Nam", current: true },
                  { device: "Safari trên iPhone", location: "Hà Nội, Việt Nam", current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {session.device}
                          {session.current && (
                            <Badge variant="secondary" className="ml-2">
                              Hiện tại
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{session.location}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        Đăng xuất
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            {/* Display Mode */}
            <Card>
              <CardHeader>
                <CardTitle>Chế độ hiển thị</CardTitle>
                <CardDescription>Chọn theme sáng, tối hoặc tự động theo hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light", label: "Sáng", icon: Sun },
                    { value: "dark", label: "Tối", icon: Moon },
                    { value: "system", label: "Hệ thống", icon: Monitor },
                  ].map((mode) => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={mode.value}
                        onClick={() => setTheme(mode.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          theme === mode.value
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{mode.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Theme Customization */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Theme Customization
                    </CardTitle>
                    <CardDescription>Tùy chỉnh màu sắc và giao diện ứng dụng</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleImportTheme}>
                      <Upload className="mr-2 h-4 w-4" />
                      Nhập
                    </Button>
                    <Button size="sm" onClick={handleCreateTheme}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo Theme
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Theme */}
                {currentTheme && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Theme Hiện Tại</h4>
                      <Button variant="outline" size="sm" onClick={handleResetTheme}>
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div>
                        <h3 className="font-semibold">{currentTheme.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={currentTheme.mode === "light" ? "default" : "secondary"}>
                            {currentTheme.mode}
                          </Badge>
                          {isCustomTheme(currentTheme.id) && <Badge variant="outline">Custom</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {Object.values(currentTheme.colors).slice(0, 6).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Theme Presets */}
                <div className="space-y-3">
                  <h4 className="font-medium">Theme Presets</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {themePresets.map((themeItem) => (
                      <div key={themeItem.id} className="relative border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-sm">{themeItem.name}</h5>
                            <p className="text-xs text-muted-foreground">{themeItem.description}</p>
                          </div>
                          {currentTheme?.id === themeItem.id && (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 mb-2">
                          {Object.values(themeItem.colors).slice(0, 8).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded border border-border flex-1"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={currentTheme?.id === themeItem.id ? "outline" : "default"}
                            className="flex-1"
                            onClick={() => handleApplyTheme(themeItem)}
                          >
                            {currentTheme?.id === themeItem.id ? "Đang dùng" : "Áp dụng"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExportTheme(themeItem)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Themes */}
                {customThemes.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Custom Themes</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {customThemes.map((themeItem) => (
                          <div key={themeItem.id} className="relative border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-sm">{themeItem.name}</h5>
                                <p className="text-xs text-muted-foreground">{themeItem.description}</p>
                              </div>
                              {currentTheme?.id === themeItem.id && (
                                <Badge variant="default" className="gap-1">
                                  <Check className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1 mb-2">
                              {Object.values(themeItem.colors).slice(0, 8).map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-6 h-6 rounded border border-border flex-1"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={currentTheme?.id === themeItem.id ? "outline" : "default"}
                                className="flex-1"
                                onClick={() => handleApplyTheme(themeItem)}
                              >
                                {currentTheme?.id === themeItem.id ? "Đang dùng" : "Áp dụng"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditTheme(themeItem)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleExportTheme(themeItem)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteClick(themeItem.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card>
              <CardHeader>
                <CardTitle>Ngôn ngữ & Khu vực</CardTitle>
                <CardDescription>Cấu hình ngôn ngữ và múi giờ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ngôn ngữ</Label>
                    <Select defaultValue="vi">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Định dạng ngày</Label>
                    <Select defaultValue="dd-mm-yyyy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onUpload={handleAvatarUpload}
        currentAvatar={currentAvatar}
      />

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        open={themeEditorOpen}
        onClose={() => setThemeEditorOpen(false)}
        onSave={handleSaveTheme}
        initialTheme={editingTheme}
      />

      {/* Delete Theme Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Theme?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa theme này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Đang tải...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
