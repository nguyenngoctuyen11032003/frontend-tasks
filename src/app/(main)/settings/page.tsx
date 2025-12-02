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
  Loader2,
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
import { api } from "@/lib/api"
import type { User as UserType } from "@/types"
import { useAuthStore } from "@/stores/auth-store"
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
  const { user: authUser, setUser: setAuthUser } = useAuthStore()
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState(tabParam || "profile")
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    department: "",
    jobRole: "",
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    weeklyReport: false,
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [phoneError, setPhoneError] = useState("")

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

  // Load user profile on mount
  useEffect(() => {
    loadProfile()
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      setSettingsLoading(true)
      const settings = await api.getMySettings()
      setNotificationSettings({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        soundEnabled: settings.soundEnabled,
      })
    } catch (error: any) {
      console.error("Failed to load settings:", error)
      toast.error("Không thể tải cài đặt", {
        description: error.message || "Sử dụng cài đặt mặc định",
      })
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    // Validate at least one channel is enabled
    if (!notificationSettings.emailNotifications && 
        !notificationSettings.pushNotifications && 
        !notificationSettings.soundEnabled) {
      toast.error("Không thể lưu", {
        description: "Phải bật ít nhất một kênh thông báo",
      })
      return
    }

    try {
      setSettingsSaving(true)
      await api.updateMySettings(notificationSettings)
      toast.success("Cập nhật thành công", {
        description: "Cài đặt thông báo đã được lưu",
      })
      await loadNotificationSettings()
    } catch (error: any) {
      console.error("Failed to update settings:", error)
      toast.error("Không thể cập nhật", {
        description: error.message || "Vui lòng thử lại sau",
      })
    } finally {
      setSettingsSaving(false)
    }
  }

  const validatePassword = () => {
    const errors: Record<string, string> = {}
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại"
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự"
    } else if (passwordData.newPassword === passwordData.oldPassword) {
      errors.newPassword = "Mật khẩu mới phải khác mật khẩu cũ"
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }
    
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return
    }

    try {
      setPasswordChanging(true)
      await api.changePassword(passwordData.oldPassword, passwordData.newPassword)
      toast.success("Đổi mật khẩu thành công", {
        description: "Mật khẩu của bạn đã được cập nhật",
      })
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordErrors({})
    } catch (error: any) {
      console.error("Failed to change password:", error)
      if (error.message.includes("incorrect") || error.message.includes("wrong")) {
        setPasswordErrors({ oldPassword: "Mật khẩu hiện tại không đúng" })
      }
      toast.error("Không thể đổi mật khẩu", {
        description: error.message || "Vui lòng kiểm tra lại thông tin",
      })
    } finally {
      setPasswordChanging(false)
    }
  }

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const user = await api.getMe()
      setCurrentUser(user)
      setCurrentAvatar(user.avatarUrl || "")
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: (user as any).bio || "",
        department: (user as any).department || "",
        jobRole: (user as any).jobRole || "",
      })
      
      // Sync with auth store to update header avatar
      if (authUser) {
        setAuthUser({ ...authUser, avatarUrl: user.avatarUrl, name: user.name })
      }
    } catch (error: any) {
      console.error("Failed to load profile:", error)
      toast.error("Không thể tải thông tin", {
        description: error.message || "Vui lòng thử lại sau",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Phone is optional
    const phoneRegex = /^0\d{9,10}$/
    return phoneRegex.test(phone)
  }

  const handleSaveProfile = async () => {
    // Validate phone if provided
    if (profileData.phone && !validatePhone(profileData.phone)) {
      setPhoneError("Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)")
      toast.error("Thông tin không hợp lệ", {
        description: "Vui lòng kiểm tra số điện thoại",
      })
      return
    }

    try {
      setProfileSaving(true)
      await api.updateMe({
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio,
        department: profileData.department,
        jobRole: profileData.jobRole,
      })
      
      // Update auth store with new name
      if (authUser) {
        setAuthUser({ ...authUser, name: profileData.name })
      }
      
      toast.success("Cập nhật thành công", {
        description: "Thông tin cá nhân đã được cập nhật",
      })
      await loadProfile() // Reload to get updated data
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast.error("Không thể cập nhật", {
        description: error.message || "Vui lòng thử lại sau",
      })
    } finally {
      setProfileSaving(false)
    }
  }

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
      // Upload file to backend
      const avatarUrl = await api.uploadAvatar(file)

      // Update user avatar in database
      await api.updateMyAvatar(avatarUrl)
      setCurrentAvatar(avatarUrl)

      // Update auth store immediately for instant header update
      if (authUser) {
        setAuthUser({ ...authUser, avatarUrl })
      }

      toast.success("Cập nhật thành công", {
        description: "Ảnh đại diện của bạn đã được cập nhật",
      })

      setAvatarModalOpen(false)
      await loadProfile() // Reload profile to sync everything
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast.error("Không thể tải ảnh lên", {
        description: error.message || "Vui lòng thử lại",
      })
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
          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !currentUser ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Không thể tải thông tin người dùng</p>
                <Button onClick={loadProfile} variant="outline" className="mt-4">
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                        <AvatarFallback className="text-xl">{currentUser?.name ? getInitials(currentUser.name) : "?"}</AvatarFallback>
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
                        {(currentUser as any).roles?.[0]?.displayName || "Member"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input 
                        id="name" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={profileSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone}
                        onChange={(e) => {
                          setProfileData({ ...profileData, phone: e.target.value })
                          if (phoneError) setPhoneError("")
                        }}
                        placeholder="Nhập số điện thoại..."
                        disabled={profileSaving}
                      />
                      {phoneError && (
                        <p className="text-sm text-red-600">{phoneError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Phòng ban</Label>
                      <Input 
                        id="department" 
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        placeholder="Nhập phòng ban..."
                        disabled={profileSaving}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="jobRole">Vai trò công việc</Label>
                      <Input 
                        id="jobRole" 
                        value={profileData.jobRole}
                        onChange={(e) => setProfileData({ ...profileData, jobRole: e.target.value })}
                        placeholder="Nhập vai trò..."
                        disabled={profileSaving}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={profileSaving || !profileData.name}>
                      {profileSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
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
                    { name: "Google", connected: false, icon: Globe },
                    { name: "GitHub", connected: false, icon: Globe },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <service.icon className="h-5 w-5" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Button variant={service.connected ? "outline" : "default"} size="sm" disabled>
                        {service.connected ? "Ngắt kết nối" : "Sắp ra mắt"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                        }
                        disabled={settingsSaving}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push notification</p>
                        <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                        }
                        disabled={settingsSaving}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Âm thanh</p>
                        <p className="text-sm text-muted-foreground">Phát âm thanh khi có thông báo mới</p>
                      </div>
                      <Switch
                        checked={notificationSettings.soundEnabled}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, soundEnabled: checked })
                        }
                        disabled={settingsSaving}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotificationSettings} 
                    disabled={settingsSaving}
                  >
                    {settingsSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu cài đặt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                  <Label htmlFor="current-password">Mật khẩu hiện tại *</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      if (passwordErrors.oldPassword) {
                        setPasswordErrors({ ...passwordErrors, oldPassword: "" })
                      }
                    }}
                    disabled={passwordChanging}
                  />
                  {passwordErrors.oldPassword && (
                    <p className="text-sm text-red-600">{passwordErrors.oldPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới *</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                      if (passwordErrors.newPassword) {
                        setPasswordErrors({ ...passwordErrors, newPassword: "" })
                      }
                    }}
                    disabled={passwordChanging}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                  {passwordData.newPassword && !passwordErrors.newPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`h-1 flex-1 rounded-full ${
                          passwordData.newPassword.length < 6 ? 'bg-red-300' :
                          passwordData.newPassword.length < 10 ? 'bg-yellow-300' :
                          'bg-green-300'
                        }`} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Độ mạnh: {
                          passwordData.newPassword.length < 6 ? 'Yếu' :
                          passwordData.newPassword.length < 10 ? 'Trung bình' :
                          'Mạnh'
                        }
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới *</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors({ ...passwordErrors, confirmPassword: "" })
                      }
                    }}
                    disabled={passwordChanging}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                <Button 
                  onClick={handleChangePassword}
                  disabled={passwordChanging || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {passwordChanging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Đổi mật khẩu
                    </>
                  )}
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
