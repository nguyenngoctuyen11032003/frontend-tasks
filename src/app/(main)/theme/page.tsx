"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCustomTheme } from "@/hooks/use-custom-theme"
import { ThemeEditorModal } from "@/components/theme-editor-modal"
import { ThemeManager, themePresets, CustomTheme } from "@/lib/theme"
import { Check, Download, Upload, Plus, Trash2, Edit, Palette } from "lucide-react"
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

export default function ThemeCustomizationPage() {
  const { currentTheme, setTheme, customThemes, saveTheme, deleteTheme, resetTheme } = useCustomTheme()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null)

  const allThemes = [...themePresets, ...customThemes]

  const handleCreateTheme = () => {
    setEditingTheme(undefined)
    setEditorOpen(true)
  }

  const handleEditTheme = (theme: CustomTheme) => {
    setEditingTheme(theme)
    setEditorOpen(true)
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
    setTheme(theme.id)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Theme & Customization</h1>
          <p className="text-muted-foreground">Tùy chỉnh giao diện theo phong cách của bạn</p>
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

      {/* Current Theme */}
      {currentTheme && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Hiện Tại
                </CardTitle>
                <CardDescription>Theme đang được áp dụng</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetTheme}>
                Reset về mặc định
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentTheme.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={currentTheme.mode === "light" ? "default" : "secondary"}>
                    {currentTheme.mode}
                  </Badge>
                  {isCustomTheme(currentTheme.id) && (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-8">
                {Object.entries(currentTheme.colors).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: value }}
                      title={key}
                    />
                    <span className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Presets */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Theme Presets</h2>
          <p className="text-sm text-muted-foreground">Chọn từ các theme có sẵn</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themePresets.map((theme) => (
            <Card key={theme.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    <CardDescription className="text-sm">{theme.description}</CardDescription>
                  </div>
                  {currentTheme?.id === theme.id && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {Object.values(theme.colors).slice(0, 8).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded border border-border flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={currentTheme?.id === theme.id ? "outline" : "default"}
                    className="flex-1"
                    onClick={() => handleApplyTheme(theme)}
                  >
                    {currentTheme?.id === theme.id ? "Đang dùng" : "Áp dụng"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportTheme(theme)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {theme.mode}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Themes */}
      {customThemes.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div>
            <h2 className="text-lg font-semibold">Custom Themes</h2>
            <p className="text-sm text-muted-foreground">Theme tùy chỉnh của bạn</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customThemes.map((theme) => (
              <Card key={theme.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{theme.name}</CardTitle>
                      <CardDescription className="text-sm">{theme.description}</CardDescription>
                    </div>
                    {currentTheme?.id === theme.id && (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    {Object.values(theme.colors).slice(0, 8).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded border border-border flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={currentTheme?.id === theme.id ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => handleApplyTheme(theme)}
                    >
                      {currentTheme?.id === theme.id ? "Đang dùng" : "Áp dụng"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditTheme(theme)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExportTheme(theme)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(theme.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {theme.mode}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveTheme}
        initialTheme={editingTheme}
      />

      {/* Delete Confirmation Dialog */}
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
