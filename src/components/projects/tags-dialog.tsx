"use client"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Trash2, X, Plus } from "lucide-react"
import { useProjectsStore } from "@/stores/projects-store"
import { TagsService } from "@/services/tags.service"
import type { Tag } from "@/types"
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

interface TagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

const TAG_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function TagsDialog({ open, onOpenChange, projectId }: TagsDialogProps) {
  const { getProject, addTags, removeTag } = useProjectsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isAddLoading, setIsAddLoading] = useState(false)
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)
  const [removingTagId, setRemovingTagId] = useState<string | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3b82f6")
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  const project = getProject(projectId)
  const currentTagIds = project?.tags?.map((t: any) => t.id) || []
  const availableTags = allTags.filter((tag) => !currentTagIds.includes(tag.id))
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch all tags when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setSelectedTagIds([])
      setShowCreateNew(false)
      setNewTagName("")
      setNewTagColor("#3b82f6")
      fetchTags()
    }
  }, [open])

  const fetchTags = async () => {
    setLoadingTags(true)
    try {
      const tags = await TagsService.getTags()
      setAllTags(tags)
    } catch (error) {
      toast.error("Không thể tải danh sách tag")
      console.error("Failed to fetch tags:", error)
    } finally {
      setLoadingTags(false)
    }
  }

  // Handle add tags
  const handleAddTags = async () => {
    if (selectedTagIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tag")
      return
    }

    setIsAddLoading(true)
    try {
      await addTags(projectId, selectedTagIds)
      toast.success(`Đã thêm ${selectedTagIds.length} tag`)
      setSelectedTagIds([])
      setSearchQuery("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi thêm tag"
      toast.error(errorMessage)
    } finally {
      setIsAddLoading(false)
    }
  }

  // Handle remove tag
  const handleRemoveTag = async () => {
    if (!removingTagId) return

    setIsRemoveLoading(true)
    try {
      await removeTag(projectId, removingTagId)
      toast.success("Đã xóa tag")
      setShowRemoveConfirm(false)
      setRemovingTagId(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi xóa tag"
      toast.error(errorMessage)
    } finally {
      setIsRemoveLoading(false)
    }
  }

  // Handle create new tag
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tên tag không được trống")
      return
    }

    setIsCreatingTag(true)
    try {
      // Create new tag
      const newTag = await TagsService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      })
      
      // Add to project
      await addTags(projectId, [newTag.id])
      
      // Refresh tags list
      await fetchTags()
      
      toast.success(`Đã tạo và thêm tag "${newTagName}"`)
      setShowCreateNew(false)
      setNewTagName("")
      setNewTagColor("#3b82f6")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi tạo tag"
      toast.error(errorMessage)
    } finally {
      setIsCreatingTag(false)
    }
  }

  const removingTag = project?.tags?.find((t: any) => t.id === removingTagId)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý tag</DialogTitle>
            <DialogDescription>Thêm hoặc xóa tag khỏi dự án</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Tags Section */}
            <div className="space-y-3">
              <h3 className="font-semibold">Tag hiện tại ({project?.tags?.length || 0})</h3>
              {project?.tags && project.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button
                        onClick={() => {
                          setRemovingTagId(tag.id)
                          setShowRemoveConfirm(true)
                        }}
                        disabled={isRemoveLoading}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có tag nào</p>
              )}
            </div>

            {/* Add Tags Section */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Thêm tag</h3>
                {!showCreateNew && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCreateNew(true)}
                    disabled={isAddLoading}
                  >
                    + Tạo mới
                  </Button>
                )}
              </div>

              {showCreateNew && (
                <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
                  <Label htmlFor="new-tag-name">Tên tag mới</Label>
                  <Input
                    id="new-tag-name"
                    placeholder="Nhập tên tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    disabled={isAddLoading}
                  />
                  <div className="space-y-2">
                    <Label>Chọn màu</Label>
                    <div className="flex gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewTagColor(color)}
                          className={`h-8 w-8 rounded-full border-2 transition-colors ${
                            newTagColor === color ? "border-gray-700" : "border-transparent hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          disabled={isAddLoading}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateNew(false)}
                      disabled={isCreatingTag}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateNewTag}
                      disabled={isCreatingTag || !newTagName.trim()}
                      className="flex items-center gap-2"
                    >
                      {isCreatingTag && <Loader2 className="h-4 w-4 animate-spin" />}
                      Tạo tag
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="tag-search">Tìm kiếm tag</Label>
                <Input
                  id="tag-search"
                  placeholder="Tìm kiếm tag hiện có..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isAddLoading || showCreateNew || loadingTags}
                />
              </div>

              {loadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Đang tải danh sách tag...</span>
                </div>
              ) : filteredTags.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredTags.map((tag) => (
                    <Card
                      key={tag.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTagIds.includes(tag.id) ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500" : ""
                      }`}
                    >
                      <CardContent
                        className="p-3 flex items-center gap-3"
                        onClick={() => {
                          setSelectedTagIds((prev) =>
                            prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium">{tag.name}</span>
                        </div>
                        <div
                          className={`h-4 w-4 rounded border-2 transition-colors ${
                            selectedTagIds.includes(tag.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchQuery ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy tag</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Tất cả tag đã được thêm</p>
              )}

              {selectedTagIds.length > 0 && !showCreateNew && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-400">
                    Đã chọn {selectedTagIds.length} tag
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTagIds([])}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAddLoading}>
              Đóng
            </Button>
            {filteredTags.length > 0 && selectedTagIds.length > 0 && !showCreateNew && (
              <Button onClick={handleAddTags} disabled={isAddLoading} className="flex items-center gap-2">
                {isAddLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAddLoading ? "Đang thêm..." : `Thêm ${selectedTagIds.length} tag`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Tag Confirmation Dialog */}
      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xóa tag "{removingTag?.name}" khỏi dự án này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoveLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveTag}
              disabled={isRemoveLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoveLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
