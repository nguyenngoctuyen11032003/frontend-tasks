"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, X, Paperclip, Tag as TagIcon, FolderOpen, Share2, Pin, Clock, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RichEditor } from "@/components/editor/rich-editor"
import { TagsInput } from "@/components/notes/tags-input"
import { cn } from "@/lib/utils"
import { NoteManager } from "@/lib/notes"
import { useTagsStore } from "@/stores/tags-store"
import type { Note, User, Project, Tag } from "@/types"

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
  const [tags, setTags] = useState<Tag[]>(
    note?.tags && Array.isArray(note.tags)
      ? note.tags.map(t => typeof t === 'string' ? { id: t, name: t, color: '#6366f1' } : t)
      : []
  )
  const [isPinned, setIsPinned] = useState(note?.isPinned || false)
  const [isShared, setIsShared] = useState(note?.isShared || false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch tags on mount
  const fetchTags = useTagsStore(state => state.fetchTags)

  useEffect(() => {
    fetchTags().catch(err => console.error('Failed to fetch tags:', err))
  }, [fetchTags])

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
          <Label className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tags
          </Label>
          <TagsInput
            selectedTags={tags}
            onTagsChange={setTags}
            placeholder="Thêm tag..."
            maxTags={10}
          />
        </div>
      </div>

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
