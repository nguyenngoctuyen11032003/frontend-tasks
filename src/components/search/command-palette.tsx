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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockProjects, mockTasks, mockUsers } from "@/mocks/data"
import type { Task, Project, User } from "@/types"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Search function
  const performSearch = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase().trim()

    if (!lowerQuery) {
      setFilteredTasks([])
      setFilteredProjects([])
      setFilteredUsers([])
      return
    }

    // Search tasks
    const tasks = mockTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery) ||
        task.id.toLowerCase().includes(lowerQuery)
    ).slice(0, 5)

    // Search projects
    const projects = mockProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery) ||
        project.id.toLowerCase().includes(lowerQuery)
    ).slice(0, 5)

    // Search users
    const users = mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.department?.toLowerCase().includes(lowerQuery) ||
        user.role?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5)

    setFilteredTasks(tasks)
    setFilteredProjects(projects)
    setFilteredUsers(users)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search)
    }, 150)

    return () => clearTimeout(timer)
  }, [search, performSearch])

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
      case "completed":
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-600" />
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
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

        {/* Quick Actions - Always visible */}
        {!search && (
          <>
            <CommandGroup heading="Điều hướng nhanh">
              <CommandItem onSelect={() => handleSelect(() => router.push("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G D
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/tasks"))}>
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>Tasks</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G T
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/projects"))}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G P
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/team"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Team</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G M
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/chat"))}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chat</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G C
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/notes"))}>
                <StickyNote className="mr-2 h-4 w-4" />
                <span>Notes</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G N
                </kbd>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/reports"))}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Reports</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  G R
                </kbd>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Cài đặt">
              <CommandItem onSelect={() => handleSelect(() => router.push("/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(() => router.push("/admin"))}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Search Results */}
        {search && (
          <>
            {/* Tasks */}
            {filteredTasks.length > 0 && (
              <>
                <CommandGroup heading={`Tasks (${filteredTasks.length})`}>
                  {filteredTasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={task.id}
                      onSelect={() => handleSelect(() => router.push(`/tasks?taskId=${task.id}`))}
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
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 && (
              <>
                <CommandGroup heading={`Projects (${filteredProjects.length})`}>
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.id}
                      onSelect={() => handleSelect(() => router.push(`/projects/${project.id}`))}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <FolderKanban className="h-4 w-4 text-primary" />
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
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Users */}
            {filteredUsers.length > 0 && (
              <CommandGroup heading={`Team Members (${filteredUsers.length})`}>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(() => router.push(`/team?userId=${user.id}`))}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{user.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email} • {user.department}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
