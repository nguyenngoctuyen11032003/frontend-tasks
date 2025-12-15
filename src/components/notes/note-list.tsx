"use client"

import { motion } from "framer-motion"
import { Clock, Pin, Tag, FolderOpen, MoreHorizontal, Edit, Trash2, Copy, Share2, StickyNote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { NoteManager } from "@/lib/notes"
import { useTagsStore } from "@/stores/tags-store"
import type { Note, Project } from "@/types"
import type { Tag as TagType } from "@/types"

interface NoteListProps {
  notes: Note[]
  projects: Project[]
  viewMode?: "grid" | "list"
  onNoteClick: (note: Note) => void
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onTogglePin?: (note: Note) => void
  onShare?: (note: Note) => void
  className?: string
}

export function NoteList({
  notes,
  projects,
  viewMode = "grid",
  onNoteClick,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePin,
  onShare,
  className,
}: NoteListProps) {
  const tagsStore = useTagsStore()
  const getProjectColor = (projectId?: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project?.color || "#64748b"
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "Personal"
    const project = projects.find((p) => p.id === projectId)
    return project?.name || "Personal"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <StickyNote className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Không tìm thấy ghi chú</h3>
        <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc tạo ghi chú mới</p>
      </div>
    )
  }

  const NoteCard = ({ note, index }: { note: Note; index: number }) => {
    const preview = NoteManager.getContentPreview(note.content, 150)
    const readingTime = NoteManager.getReadingTime(note.content)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        layout
      >
        <Card
          className={cn(
            "cursor-pointer hover:shadow-md transition-all group h-full",
            note.isPinned && "ring-2 ring-amber-400/50"
          )}
          onClick={() => onNoteClick(note)}
        >
          <CardContent className="p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {note.isPinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />}
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getProjectColor(note.projectId) }}
                />
                <span className="text-xs text-muted-foreground truncate">{getProjectName(note.projectId)}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onTogglePin && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onTogglePin(note)
                      }}
                    >
                      <Pin className="mr-2 h-4 w-4" />
                      {note.isPinned ? "Bỏ ghim" : "Ghim"}
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(note)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicate(note)
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Nhân bản
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onShare(note)
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Chia sẻ
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(note)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title */}
            <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {note.title}
            </h3>

            {/* Content Preview */}
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">{preview}</p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.slice(0, 3).map((tag) => {
                  let tagName = ""
                  let tagColor = "#64748b"
                  let tagId = ""
                  
                  // Handle both string IDs and tag objects
                  if (typeof tag === 'string') {
                    // Try to resolve the tag ID from store
                    const resolvedTag = tagsStore.getTagById(tag)
                    if (resolvedTag) {
                      tagName = resolvedTag.name
                      tagColor = resolvedTag.color || "#64748b"
                      tagId = resolvedTag.id
                    } else {
                      // Fallback: show the ID if tag not found in store
                      tagName = tag.substring(0, 8) + "..."
                      tagId = tag
                    }
                  } else {
                    tagName = tag.name
                    tagColor = tag.color || "#64748b"
                    tagId = tag.id
                  }
                  
                  return (
                    <Badge 
                      key={tagId} 
                      variant="secondary" 
                      className="text-xs"
                      title={tagName}
                      style={{
                        backgroundColor: `${tagColor}20`,
                        color: tagColor,
                        border: `1px solid ${tagColor}40`
                      }}
                    >
                      {tagName}
                    </Badge>
                  )
                })}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(note.updatedAt)}
              </div>
              {readingTime > 0 && (
                <div className="flex items-center gap-1">
                  ~{readingTime} phút đọc
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "space-y-3",
        className
      )}
    >
      {notes.map((note, index) => (
        <NoteCard key={note.id} note={note} index={index} />
      ))}
    </div>
  )
}
