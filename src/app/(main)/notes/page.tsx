"use client"
import { useState, useMemo } from "react"
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
import { mockNotes, mockProjects, mockUsers } from "@/mocks/data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Note } from "@/types"
import { NoteEditor } from "@/components/notes/note-editor"
import { NoteList } from "@/components/notes/note-list"
import { NoteManager } from "@/lib/notes"
import { RichEditor } from "@/components/editor/rich-editor"

type ViewMode = "grid" | "list"
type NoteTab = "note" | "todo"
type EditorMode = "view" | "edit" | "create"

interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export default function NotesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>("view")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<NoteTab>("note")
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    return NoteManager.filterNotes(mockNotes, {
      search: searchQuery,
      projectId: projectFilter,
      isPinned: showPinnedOnly ? true : undefined,
    })
  }, [searchQuery, projectFilter, showPinnedOnly])

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
    // TODO: Call API
    toast.success(editorMode === "create" ? "Đã tạo ghi chú mới" : "Đã lưu thay đổi")
    setEditorMode("view")
  }

  const handleCancel = () => {
    if (editorMode === "create") {
      setSelectedNote(null)
    }
    setEditorMode("view")
  }

  const handleDelete = (note: Note) => {
    // TODO: Call API
    toast.success("Đã xóa ghi chú")
    if (selectedNote?.id === note.id) {
      setSelectedNote(null)
    }
  }

  const handleDuplicate = (note: Note) => {
    const duplicated = NoteManager.duplicateNote(note)
    // TODO: Call API to create
    toast.success("Đã nhân bản ghi chú")
  }

  const handleTogglePin = (note: Note) => {
    // TODO: Call API
    toast.success(note.isPinned ? "Đã bỏ ghim" : "Đã ghim ghi chú")
  }

  const handleShare = (note: Note) => {
    // TODO: Implement share dialog
    toast.info("Tính năng chia sẻ đang phát triển")
  }

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

  const stats = NoteManager.getNotesStats(mockNotes)

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
        <Button onClick={handleCreate}>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    {mockProjects.map((project) => (
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
            {(searchQuery || projectFilter !== "all" || showPinnedOnly) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Bộ lọc:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="hover:text-destructive">
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {projectFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Dự án: {projectFilter === "personal" ? "Personal" : mockProjects.find((p) => p.id === projectFilter)?.name}
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
                    setSearchQuery("")
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {!showPinnedOnly && pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Pin className="h-4 w-4" />
            Đã ghim ({pinnedNotes.length})
          </h3>
          <NoteList
            notes={pinnedNotes}
            projects={mockProjects}
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
            projects={mockProjects}
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
          projects={mockProjects}
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
        <div className="flex flex-col items-center justify-center py-16">
          <StickyNote className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Không tìm thấy ghi chú</h3>
          <p className="text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc tạo ghi chú mới</p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo ghi chú đầu tiên
          </Button>
        </div>
      )}

      {/* Note Detail/Editor Dialog */}
      <Dialog
        open={!!selectedNote || editorMode === "create"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNote(null)
            setEditorMode("view")
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
                  projects={mockProjects}
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
                      {mockProjects.find((p) => p.id === selectedNote.projectId)?.name || "Personal"}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl">{selectedNote.title}</DialogTitle>
                  <DialogDescription>
                    Cập nhật: {new Date(selectedNote.updatedAt).toLocaleDateString("vi-VN")} •{" "}
                    {NoteManager.getReadingTime(selectedNote.content)} phút đọc
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NoteTab)} className="flex-1">
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
                        {selectedNote.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
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
                            <Checkbox checked={todo.completed} onCheckedChange={() => handleToggleTodo(todo.id)} />
                            <span className={cn("flex-1", todo.completed && "line-through text-muted-foreground")}>
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
                              width: `${todos.length > 0 ? (todos.filter((t) => t.completed).length / todos.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(selectedNote)}>
                      Nhân bản
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(selectedNote)}>
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
