"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, X, Paperclip, Tag, FolderOpen, Share2, Pin, Clock, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RichEditor } from "@/components/editor/rich-editor"
import { cn } from "@/lib/utils"
import { NoteManager } from "@/lib/notes"
import type { Note, User, Project } from "@/types"

interface NoteEditorProps {
  note?: Note
  projects: Project[]
  users: User[]
  onSave: (note: Partial<Note>) => void
  onCancel: () => void
  className?: string
}

export function NoteEditor({ note, projects, users, onSave, onCancel, className }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [projectId, setProjectId] = useState<string | undefined>(note?.projectId)
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [isPinned, setIsPinned] = useState(note?.isPinned || false)
  const [isShared, setIsShared] = useState(note?.isShared || false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const newTags = NoteManager.parseTags(tagInput)
    setTags([...new Set([...tags, ...newTags])])
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const noteData: Partial<Note> = {
        ...note,
        title: title.trim(),
        content,
        projectId,
        tags,
        isPinned,
        isShared,
        updatedAt: new Date().toISOString(),
      }

      if (!note) {
        noteData.createdAt = new Date().toISOString()
      }

      await onSave(noteData)
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = NoteManager.getWordCount(content)
  const readingTime = NoteManager.getReadingTime(content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("space-y-4", className)}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{note ? "Chỉnh sửa ghi chú" : "Tạo ghi chú mới"}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPinned(!isPinned)}
            className={cn(isPinned && "text-amber-500")}
          >
            <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShared(!isShared)}
            className={cn(isShared && "text-primary")}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.trim() || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Tiêu đề <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề ghi chú..."
          className="text-lg font-medium"
          autoFocus
        />
      </div>

      {/* Project & Tags Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Project */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Dự án
          </Label>
          <Select value={projectId || "personal"} onValueChange={(v) => setProjectId(v === "personal" ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dự án" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Thêm tag..."
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
              Thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Content Editor */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Nội dung
          {content && (
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                {wordCount} từ
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{readingTime} phút đọc
              </span>
            </span>
          )}
        </Label>
        <RichEditor
          content={content}
          onChange={setContent}
          placeholder="Viết nội dung ghi chú của bạn..."
          users={users}
          className="min-h-[400px]"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1">
          <Pin className={cn("h-3 w-3", isPinned && "text-amber-500 fill-current")} />
          {isPinned ? "Đã ghim" : "Chưa ghim"}
        </div>
        <div className="flex items-center gap-1">
          <Share2 className={cn("h-3 w-3", isShared && "text-primary")} />
          {isShared ? "Đã chia sẻ" : "Riêng tư"}
        </div>
        {note && (
          <>
            <div className="ml-auto">Tạo: {new Date(note.createdAt).toLocaleDateString("vi-VN")}</div>
            <div>Cập nhật: {new Date(note.updatedAt).toLocaleDateString("vi-VN")}</div>
          </>
        )}
      </div>
    </motion.div>
  )
}
