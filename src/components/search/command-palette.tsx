"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Search,
  FileText,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  UserCog,
  StickyNote,
  Clock,
  Calendar,
  CheckSquare,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import useSearchStore from "@/stores/search-store"
import SearchService, { SearchType } from "@/services/search.service"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  
  // Subscribe to search store
  const searchResults = useSearchStore((state) => state.searchResults)
  const suggestions = useSearchStore((state) => state.suggestions)
  const loading = useSearchStore((state) => state.loading)
  const suggestionsLoading = useSearchStore((state) => state.suggestionsLoading)
  const error = useSearchStore((state) => state.error)
  const { search: performSearch, getSuggestions, clearResults } = useSearchStore()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        performSearch(search, SearchType.ALL, 20)
        getSuggestions(search, SearchType.ALL, 5)
      } else {
        clearResults()
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [search, performSearch, getSuggestions, clearResults])

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = useCallback(
    (callback: () => void) => {
      onOpenChange(false)
      callback()
    },
    [onOpenChange]
  )

  const getTaskIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Tìm kiếm tasks, projects, users hoặc nhập lệnh..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {/* Loading State */}
        {loading && !searchResults && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Đang tìm kiếm...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded mx-2 mt-2">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!search && !loading && !error && (
          <>
            <CommandGroup heading="Điều hướng nhanh">
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/dashboard")
              }}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G D
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/tasks")
              }}>
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>Tasks</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G T
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/projects")
              }}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G P
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/team")
              }}>
                <Users className="mr-2 h-4 w-4" />
                <span>Team</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G M
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/chat")
              }}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G C
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/notes")
              }}>
                <StickyNote className="mr-2 h-4 w-4" />
                <span>Notes</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G N
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/reports")
              }}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Reports</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G R
                </kbd>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Cài đặt">
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/settings")
              }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                onOpenChange(false)
                router.push("/admin")
              }}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Search Results */}
        {search && !loading && searchResults && (
          <>
            {/* Suggestions (Autocomplete) */}
            {suggestionsLoading && (
              <div className="p-2 text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Đang gợi ý...
              </div>
            )}

            {!suggestionsLoading && suggestions.length > 0 && (
              <>
                <CommandGroup heading="Gợi ý">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={`${suggestion.type}-${suggestion.id}`}
                      value={suggestion.id}
                      onSelect={() => {
                        onOpenChange(false)
                        useSearchStore.getState().saveToHistory(search, suggestion.type)
                        // Navigate based on type
                        switch (suggestion.type) {
                          case "task":
                            router.push(`/tasks?taskId=${suggestion.id}`)
                            break
                          case "project":
                            router.push(`/projects/${suggestion.id}`)
                            break
                          case "note":
                            router.push(`/notes/${suggestion.id}`)
                            break
                          case "user":
                            router.push(`/team?userId=${suggestion.id}`)
                            break
                          case "chat":
                            router.push(`/chat/${suggestion.id}`)
                            break
                        }
                      }}
                    >
                      <Search className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="truncate">{suggestion.text}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {suggestion.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Tasks Results */}
            {searchResults.results.tasks && searchResults.results.tasks.length > 0 && (
              <>
                <CommandGroup heading={`Tasks (${searchResults.results.tasks.length})`}>
                  {searchResults.results.tasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={task.id}
                      onSelect={() => {
                        onOpenChange(false)
                        useSearchStore.getState().saveToHistory(search, "tasks")
                        router.push(`/tasks?taskId=${task.id}`)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {getTaskIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{task.title}</span>
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Projects Results */}
            {searchResults.results.projects && searchResults.results.projects.length > 0 && (
              <>
                <CommandGroup heading={`Projects (${searchResults.results.projects.length})`}>
                  {searchResults.results.projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.id}
                      onSelect={() => {
                        onOpenChange(false)
                        useSearchStore.getState().saveToHistory(search, "projects")
                        router.push(`/projects/${project.id}`)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <FolderKanban className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{project.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                          {project.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Notes Results */}
            {searchResults.results.notes && searchResults.results.notes.length > 0 && (
              <>
                <CommandGroup heading={`Notes (${searchResults.results.notes.length})`}>
                  {searchResults.results.notes.map((note) => (
                    <CommandItem
                      key={note.id}
                      value={note.id}
                      onSelect={() => {
                        onOpenChange(false)
                        useSearchStore.getState().saveToHistory(search, "notes")
                        router.push(`/notes/${note.id}`)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <StickyNote className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{note.title}</span>
                            {note.isPinned && (
                              <Badge variant="secondary" className="text-xs">Pinned</Badge>
                            )}
                          </div>
                          {note.content && (
                            <p className="text-xs text-muted-foreground truncate">
                              {note.content}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Users Results */}
            {searchResults.results.users && searchResults.results.users.length > 0 && (
              <>
                <CommandGroup heading={`Users (${searchResults.results.users.length})`}>
                  {searchResults.results.users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        onOpenChange(false)
                        useSearchStore.getState().saveToHistory(search, "users")
                        router.push(`/team?userId=${user.id}`)
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{user.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                          {user.bio && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.bio}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Chats Results */}
            {searchResults.results.chats && searchResults.results.chats.length > 0 && (
              <CommandGroup heading={`Chats (${searchResults.results.chats.length})`}>
                {searchResults.results.chats.map((chat) => (
                  <CommandItem
                    key={chat.id}
                    value={chat.id}
                    onSelect={() => {
                      onOpenChange(false)
                      useSearchStore.getState().saveToHistory(search, "chats")
                      router.push(`/chat/${chat.id}`)
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <MessageSquare className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{chat.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {chat.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.members.length} member{chat.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* No Results */}
            {!loading && searchResults.totalResults === 0 && (
              <CommandEmpty>Không tìm thấy kết quả cho "{search}"</CommandEmpty>
            )}
          </>
        )}

        {!search && <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>}
      </CommandList>
    </CommandDialog>
  )
}
