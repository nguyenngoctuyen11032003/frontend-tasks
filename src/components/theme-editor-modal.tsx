"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { CustomTheme, ThemeColors, defaultThemeColors } from "@/lib/theme"
import { Paintbrush, Type, Circle } from "lucide-react"
import { toast } from "sonner"

interface ThemeEditorModalProps {
  open: boolean
  onClose: () => void
  onSave: (theme: CustomTheme) => void
  initialTheme?: CustomTheme
}

export function ThemeEditorModal({ open, onClose, onSave, initialTheme }: ThemeEditorModalProps) {
  const [theme, setTheme] = useState<CustomTheme>(
    initialTheme || {
      id: `custom-${Date.now()}`,
      name: "",
      description: "",
      colors: { ...defaultThemeColors },
      mode: "light",
    }
  )

  const handleSave = () => {
    if (!theme.name.trim()) {
      toast.error("Thiếu tên theme", {
        description: "Vui lòng nhập tên cho theme của bạn",
      })
      return
    }

    onSave(theme)
    onClose()
    toast.success("Đã lưu theme", {
      description: `Theme "${theme.name}" đã được lưu thành công`,
    })
  }

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }))
  }

  const colorInputs: Array<{ key: keyof ThemeColors; label: string; description: string }> = [
    { key: "primary", label: "Primary", description: "Màu chính của theme" },
    { key: "secondary", label: "Secondary", description: "Màu phụ" },
    { key: "accent", label: "Accent", description: "Màu nhấn mạnh" },
    { key: "background", label: "Background", description: "Màu nền" },
    { key: "foreground", label: "Foreground", description: "Màu chữ chính" },
    { key: "muted", label: "Muted", description: "Màu nền mờ" },
    { key: "mutedForeground", label: "Muted Foreground", description: "Màu chữ mờ" },
    { key: "card", label: "Card", description: "Màu nền card" },
    { key: "cardForeground", label: "Card Foreground", description: "Màu chữ card" },
    { key: "border", label: "Border", description: "Màu viền" },
    { key: "input", label: "Input", description: "Màu input" },
    { key: "ring", label: "Ring", description: "Màu focus ring" },
    { key: "success", label: "Success", description: "Màu thành công" },
    { key: "warning", label: "Warning", description: "Màu cảnh báo" },
    { key: "error", label: "Error", description: "Màu lỗi" },
    { key: "info", label: "Info", description: "Màu thông tin" },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTheme ? "Chỉnh sửa Theme" : "Tạo Theme Mới"}
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh màu sắc, typography và spacing cho theme của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Tên Theme *</Label>
              <Input
                id="theme-name"
                value={theme.name}
                onChange={(e) => setTheme({ ...theme, name: e.target.value })}
                placeholder="Nhập tên theme..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-description">Mô tả</Label>
              <Textarea
                id="theme-description"
                value={theme.description || ""}
                onChange={(e) => setTheme({ ...theme, description: e.target.value })}
                placeholder="Mô tả ngắn về theme..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-mode">Mode</Label>
              <Select
                value={theme.mode}
                onValueChange={(value: "light" | "dark") => setTheme({ ...theme, mode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme Customization Tabs */}
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors" className="gap-2">
                <Paintbrush className="h-4 w-4" />
                Màu sắc
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Circle className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {colorInputs.map(({ key, label, description }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`color-${key}`} className="text-sm font-medium">
                      {label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`color-${key}`}
                        value={theme.colors[key] || ""}
                        onChange={(e) => updateColor(key, e.target.value)}
                        placeholder="hsl(0 0% 0%)"
                        className="flex-1 font-mono text-xs"
                      />
                      <div
                        className="w-10 h-10 rounded border border-border flex-shrink-0"
                        style={{ backgroundColor: theme.colors[key] }}
                        title={description}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Preview Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Xem trước các màu sắc của theme
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {colorInputs.map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <div
                        className="h-16 rounded border border-border"
                        style={{ backgroundColor: theme.colors[key] }}
                      />
                      <p className="text-xs text-center">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Component Preview</h4>
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}>
                      Primary Button
                    </Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                  </div>
                  <Card className="p-4" style={{ backgroundColor: theme.colors.card }}>
                    <p style={{ color: theme.colors.cardForeground }}>
                      Đây là một card với màu nền và màu chữ của theme
                    </p>
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {initialTheme ? "Cập nhật" : "Tạo Theme"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
