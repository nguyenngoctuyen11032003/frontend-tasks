"use client"
import { useState, useMemo, useEffect } from "react"
import { useNotesStore } from "@/stores/notes-store"
import { useProjectsStore } from "@/stores/projects-store"
import { useTagsStore } from "@/stores/tags-store"
import { AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Pin,
  FolderOpen,
  StickyNote,
  CheckSquare,
  Filter,
  X as XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mockProjects, mockUsers } from "@/mocks/data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Note } from "@/types"
import { NoteEditor } from "@/components/notes/note-editor"
import { NoteList } from "@/components/notes/note-list"
import { EmptyNotes } from "@/components/notes/empty-notes"
import { NoteManager } from "@/lib/notes"

type ViewMode = "grid" | "list"
type NoteTab = "note" | "todo"
type EditorMode = "view" | "edit" | "create"

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export default function NotesPage() {
  const notesStore = useNotesStore()
  const projectsStore = useProjectsStore()
  const tagsStore = useTagsStore()
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>("view")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<NoteTab>("note")
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  // Fetch tags first, then notes and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load tags first so they're available for resolving tag IDs
        await tagsStore.fetchTags()
      } catch (error) {
        console.error("Failed to fetch tags:", error)
      }
      
      try {
        notesStore.clearFilters()
        await notesStore.fetchNotes()
      } catch (error) {
        toast.error("Không thể tải ghi chú")
        console.error("Failed to fetch notes:", error)
      }

      try {
        await projectsStore.fetchProjects()
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    loadData()
  }, [])

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    const notes = Array.isArray(notesStore.notes) ? notesStore.notes : []
    let filtered = [...notes]

    // Apply search query
    if (notesStore.searchQuery) {
      const query = notesStore.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      )
    }

    // Apply project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter((n) =>
        projectFilter === "personal" ? !n.projectId : n.projectId === projectFilter
      )
    }

    // Apply pinned filter
    if (showPinnedOnly) {
      filtered = filtered.filter((n) => n.isPinned)
    }

    return filtered
  }, [notesStore.notes, notesStore.searchQuery, projectFilter, showPinnedOnly])

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned)

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setEditorMode("view")
  }

  const handleEdit = (note?: Note) => {
    if (note) {
      setSelectedNote(note)
    }
    setEditorMode("edit")
  }

  const handleCreate = () => {
    setSelectedNote(null)
    setEditorMode("create")
  }

  const handleSave = async (noteData: Partial<Note>) => {
    try {
      if (editorMode === "create") {
        // Create note without tags
        const createdNote = await notesStore.createNote({
          title: noteData.title!,
          content: noteData.content || "",
          projectId: noteData.projectId,
        })
        
        // Add tags after note is created
        const tagIds = (noteData.tags || [])
          .map(tag => typeof tag === 'string' ? tag : tag.id)
          .filter(Boolean) as string[]
        
        if (tagIds.length > 0) {
          try {
            for (const tagId of tagIds) {
              await notesStore.addTag(createdNote.id, tagId)
            }
          } catch (error) {
            console.error("Failed to add tags to note:", error)
            toast.warning("Ghi chú đã tạo nhưng không thể thêm tất cả tags")
          }
        }
        
        // Save todos if any
        if (todos.length > 0) {
          try {
            await notesStore.updateNote(createdNote.id, {
              todos,
            })
          } catch (error) {
            console.error("Failed to save todos:", error)
          }
        }
        
        toast.success("Đã tạo ghi chú mới")
      } else if (selectedNote) {
        // Update note without tags
        await notesStore.updateNote(selectedNote.id, {
          title: noteData.title,
          content: noteData.content,
          projectId: noteData.projectId,
          todos,
        })
        
        // Handle tag changes
        const newTagIds = (noteData.tags || [])
          .map(tag => typeof tag === 'string' ? tag : tag.id)
          .filter(Boolean) as string[]
        
        const oldTagIds = (selectedNote.tags || [])
          .map(tag => typeof tag === 'string' ? tag : tag.id)
          .filter(Boolean) as string[]
        
        // Remove tags that are no longer selected
        for (const tagId of oldTagIds) {
          if (!newTagIds.includes(tagId)) {
            try {
              await notesStore.removeTag(selectedNote.id, tagId)
            } catch (error) {
              console.error("Failed to remove tag:", error)
            }
          }
        }
        
        // Add new tags
        for (const tagId of newTagIds) {
          if (!oldTagIds.includes(tagId)) {
            try {
              await notesStore.addTag(selectedNote.id, tagId)
            } catch (error) {
              console.error("Failed to add tag:", error)
            }
          }
        }
        
        toast.success("Đã lưu thay đổi")
      }
      setEditorMode("view")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error(errorMessage)
      console.error("Failed to save note:", error)
    }
  }

  const handleCancel = () => {
    if (editorMode === "create") {
      setSelectedNote(null)
    }
    setEditorMode("view")
  }

  const handleDelete = async (note: Note) => {
    try {
      await notesStore.deleteNote(note.id)
      toast.success("Đã xóa ghi chú")
      if (selectedNote?.id === note.id) {
        setSelectedNote(null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error(errorMessage)
      console.error("Failed to delete note:", error)
    }
  }

  const handleDuplicate = async (note: Note) => {
    try {
      await notesStore.duplicateNote(note.id)
      toast.success("Đã nhân bản ghi chú")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error(errorMessage)
      console.error("Failed to duplicate note:", error)
    }
  }

  const handleTogglePin = async (note: Note) => {
    try {
      await notesStore.togglePin(note.id)
      toast.success(note.isPinned ? "Đã bỏ ghim" : "Đã ghim ghi chú")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
      toast.error(errorMessage)
      console.error("Failed to toggle pin:", error)
    }
  }

  const handleShare = (note: Note) => {
    // TODO: Implement share dialog with user selection
    toast.info("Tính năng chia sẻ sẽ được triển khai")
  }

  // Reset todos when note selection changes
  useEffect(() => {
    if (selectedNote && selectedNote.id) {
      // Parse todos from note content if available (stored in note metadata)
      const noteTodos = (selectedNote as any).todos || []
      setTodos(noteTodos)
      setActiveTab("note")
    } else {
      setTodos([])
      setNewTodoText("")
    }
  }, [selectedNote?.id])

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: newTodoText,
      completed: false,
    }
    setTodos([...todos, newTodo])
    setNewTodoText("")
  }

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const hasFilters = !!(notesStore.searchQuery || projectFilter !== "all" || showPinnedOnly)

  const notes = Array.isArray(notesStore.notes) ? notesStore.notes : []
  const stats = {
    total: notes.length,
    pinned: notes.filter((n) => n.isPinned).length,
    shared: notes.filter((n) => n.isShared).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Ghi chú</h1>
          <p className="text-muted-foreground">
            {stats.total} ghi chú • {stats.pinned} đã ghim • {stats.shared} đã chia sẻ
          </p>
        </div>
        <Button onClick={handleCreate} disabled={notesStore.loading}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo ghi chú
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm ghi chú..."
                    className="pl-9"
                    value={notesStore.searchQuery}
                    onChange={(e) => notesStore.setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Dự án" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả dự án</SelectItem>
                    <SelectItem value="personal">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-3 w-3 text-muted-foreground" />
                        Personal
                      </div>
                    </SelectItem>
                    {projectsStore.projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={showPinnedOnly ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  className="gap-2"
                >
                  <Pin className={cn("h-4 w-4", showPinnedOnly && "fill-current")} />
                  <span className="hidden sm:inline">Đã ghim</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Bộ lọc:</span>
                {notesStore.searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {notesStore.searchQuery}
                    <button
                      onClick={() => notesStore.setSearchQuery("")}
                      className="hover:text-destructive"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {projectFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Dự án:{" "}
                    {projectFilter === "personal"
                      ? "Personal"
                      : projectsStore.projects.find((p) => p.id === projectFilter)?.name}
                    <button onClick={() => setProjectFilter("all")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {showPinnedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Đã ghim
                    <button onClick={() => setShowPinnedOnly(false)} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    notesStore.setSearchQuery("")
                    setProjectFilter("all")
                    setShowPinnedOnly(false)
                  }}
                  className="h-7"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}

            {/* Stats */}
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredNotes.length} / {stats.total} ghi chú
              {notesStore.loading && <span className="ml-2">đang tải...</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {notesStore.loading && filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Đang tải ghi chú...</p>
        </div>
      )}

      {/* Notes */}
      {!notesStore.loading && (
        <>
          {!showPinnedOnly && pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Đã ghim ({pinnedNotes.length})
              </h3>
              <NoteList
                notes={pinnedNotes}
                projects={projectsStore.projects}
                viewMode={viewMode}
                onNoteClick={handleNoteClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onTogglePin={handleTogglePin}
                onShare={handleShare}
              />
            </div>
          )}

          {!showPinnedOnly && unpinnedNotes.length > 0 && (
            <div className="space-y-4">
              {pinnedNotes.length > 0 && (
                <h3 className="text-sm font-medium text-muted-foreground">Khác ({unpinnedNotes.length})</h3>
              )}
              <NoteList
                notes={unpinnedNotes}
                projects={projectsStore.projects}
                viewMode={viewMode}
                onNoteClick={handleNoteClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onTogglePin={handleTogglePin}
                onShare={handleShare}
              />
            </div>
          )}

          {showPinnedOnly && filteredNotes.length > 0 && (
            <NoteList
              notes={filteredNotes}
              projects={projectsStore.projects}
              viewMode={viewMode}
              onNoteClick={handleNoteClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onTogglePin={handleTogglePin}
              onShare={handleShare}
            />
          )}

          {filteredNotes.length === 0 && (
            <EmptyNotes
              hasFilters={hasFilters}
              onCreateNote={handleCreate}
              onClearFilters={() => {
                notesStore.setSearchQuery("")
                setProjectFilter("all")
                setShowPinnedOnly(false)
              }}
            />
          )}
        </>
      )}

      {/* Note Detail/Editor Dialog */}
      <Dialog
        open={!!selectedNote || editorMode === "create"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNote(null)
            setEditorMode("view")
            setTodos([])
            setNewTodoText("")
            setActiveTab("note")
          }
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          {editorMode === "edit" || editorMode === "create" ? (
            <>
              <DialogTitle className="sr-only">
                {editorMode === "create" ? "Tạo ghi chú mới" : "Chỉnh sửa ghi chú"}
              </DialogTitle>
              <div className="overflow-y-auto flex-1">
                <NoteEditor
                  note={editorMode === "edit" ? selectedNote! : undefined}
                  projects={projectsStore.projects}
                  users={mockUsers}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            </>
          ) : (
            selectedNote && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedNote.isPinned && <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    <span className="text-sm text-muted-foreground">
                      {projectsStore.projects.find((p) => p.id === selectedNote.projectId)?.name ||
                        "Personal"}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl">{selectedNote.title}</DialogTitle>
                  <DialogDescription>
                    Cập nhật: {new Date(selectedNote.updatedAt).toLocaleDateString("vi-VN")} •{" "}
                    {NoteManager.getReadingTime(selectedNote.content)} phút đọc
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as NoteTab)}
                  className="flex-1"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="note">
                      <StickyNote className="mr-2 h-4 w-4" />
                      Ghi chú
                    </TabsTrigger>
                    <TabsTrigger value="todo">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Todo ({todos.filter((t) => t.completed).length}/{todos.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="note" className="py-4 overflow-y-auto max-h-[50vh]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedNote.content }} />
                    </div>
                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                        {selectedNote.tags.map((tag) => {
                          const tagName = typeof tag === 'string' ? tag : tag.name
                          const tagId = typeof tag === 'string' ? tag : tag.id
                          const tagColor = typeof tag === 'string' ? '#64748b' : (tag.color || '#64748b')
                          return (
                            <Badge 
                              key={tagId} 
                              variant="secondary"
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
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="todo" className="py-4 space-y-4 overflow-y-auto max-h-[50vh]">
                    {/* Add new todo */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Thêm công việc mới..."
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddTodo()
                          }
                        }}
                      />
                      <Button onClick={handleAddTodo} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Todo list */}
                    <div className="space-y-2">
                      {todos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Chưa có công việc nào</p>
                        </div>
                      ) : (
                        todos.map((todo) => (
                          <div
                            key={todo.id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => handleToggleTodo(todo.id)}
                            />
                            <span
                              className={cn(
                                "flex-1",
                                todo.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {todo.text}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Progress */}
                    {todos.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">
                            {todos.filter((t) => t.completed).length}/{todos.length} hoàn thành
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${todos.length > 0
                                ? (todos.filter((t) => t.completed).length / todos.length) * 100
                                : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(selectedNote)}
                      disabled={notesStore.loadingNoteId === selectedNote.id}
                    >
                      Nhân bản
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedNote)}
                      disabled={notesStore.loadingNoteId === selectedNote.id}
                    >
                      Xóa
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedNote(null)}>
                      Đóng
                    </Button>
                    <Button onClick={() => handleEdit(selectedNote)}>
                      Chỉnh sửa
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
