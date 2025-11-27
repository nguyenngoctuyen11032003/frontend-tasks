import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { toast } from "sonner"
import type { Project, Task as TaskType, User } from "@/types"
import { mockProjects, mockTasks, mockUsers } from "@/mocks/data"

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==================== PROJECTS ====================

interface ProjectFilters {
  search?: string
  status?: string
  sortBy?: string
}

// Fetch all projects
export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: queryKeys.projects.list(JSON.stringify(filters)),
    queryFn: async () => {
      await delay(500) // Simulate API call
      
      let projects = [...mockProjects]
      
      // Apply filters
      if (filters.search) {
        projects = projects.filter((p) =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.description?.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters.status) {
        projects = projects.filter((p) => p.status === filters.status)
      }
      
      // Apply sorting
      if (filters.sortBy) {
        projects.sort((a, b) => {
          switch (filters.sortBy) {
            case "name":
              return a.name.localeCompare(b.name)
            case "deadline":
              return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            case "progress":
              return (b.progress || 0) - (a.progress || 0)
            default:
              return 0
          }
        })
      }
      
      return projects
    },
  })
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      await delay(300)
      const project = mockProjects.find((p) => p.id === id)
      if (!project) throw new Error("Project not found")
      return project
    },
    enabled: !!id,
  })
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      await delay(800)
      const newProject: Project = {
        ...data,
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newProject
    },
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      toast.success(`Đã tạo dự án "${newProject.name}"`)
    },
    onError: (error: Error) => {
      toast.error("Lỗi tạo dự án", {
        description: error.message,
      })
    },
  })
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      await delay(600)
      const project = mockProjects.find((p) => p.id === id)
      if (!project) throw new Error("Project not found")
      
      const updatedProject = {
        ...project,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return updatedProject
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) })
      
      // Snapshot previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(id))
      
      // Optimistically update cache
      queryClient.setQueryData(queryKeys.projects.detail(id), (old: Project | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : old
      )
      
      return { previousProject }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), context.previousProject)
      }
      toast.error("Lỗi cập nhật dự án", {
        description: error.message,
      })
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      toast.success("Đã cập nhật dự án")
    },
  })
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500)
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) })
      toast.success("Đã xóa dự án")
    },
    onError: (error: Error) => {
      toast.error("Lỗi xóa dự án", {
        description: error.message,
      })
    },
  })
}

// ==================== TASKS ====================

interface TaskFilters {
  search?: string
  status?: string
  priority?: string
  projectId?: string
  assigneeId?: string
  sortBy?: string
}

// Fetch all tasks
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tasks.list(JSON.stringify(filters)),
    queryFn: async () => {
      await delay(500)
      
      let tasks = [...mockTasks]
      
      // Apply filters
      if (filters.search) {
        tasks = tasks.filter((t) =>
          t.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          t.description?.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters.status) {
        tasks = tasks.filter((t) => t.status === filters.status)
      }
      
      if (filters.priority) {
        tasks = tasks.filter((t) => t.priority === filters.priority)
      }
      
      if (filters.projectId) {
        tasks = tasks.filter((t) => t.projectId === filters.projectId)
      }
      
      if (filters.assigneeId) {
        tasks = tasks.filter((t) => t.assignees.some((a) => a.id === filters.assigneeId))
      }
      
      // Apply sorting
      if (filters.sortBy) {
        tasks.sort((a, b) => {
          switch (filters.sortBy) {
            case "title":
              return a.title.localeCompare(b.title)
            case "dueDate":
              return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
            case "priority": {
              const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
              return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
            }
            default:
              return 0
          }
        })
      }
      
      return tasks
    },
  })
}

// Fetch single task
export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: async () => {
      await delay(300)
      const task = mockTasks.find((t) => t.id === id)
      if (!task) throw new Error("Task not found")
      return task
    },
    enabled: !!id,
  })
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Omit<TaskType, "id" | "createdAt" | "updatedAt">) => {
      await delay(800)
      const newTask: TaskType = {
        ...data,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newTask
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      if (newTask.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(newTask.projectId) })
      }
      toast.success(`Đã tạo task "${newTask.title}"`)
    },
    onError: (error: Error) => {
      toast.error("Lỗi tạo task", {
        description: error.message,
      })
    },
  })
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskType> }) => {
      await delay(600)
      const task = mockTasks.find((t) => t.id === id)
      if (!task) throw new Error("Task not found")
      
      const updatedTask = {
        ...task,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return updatedTask
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) })
      
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(id))
      
      queryClient.setQueryData(queryKeys.tasks.detail(id), (old: TaskType | undefined) =>
        old ? { ...old, ...data, updatedAt: new Date().toISOString() } : old
      )
      
      return { previousTask }
    },
    onError: (error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previousTask)
      }
      toast.error("Lỗi cập nhật task", {
        description: error.message,
      })
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      if (updatedTask.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(updatedTask.projectId) })
      }
      toast.success("Đã cập nhật task")
    },
  })
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(500)
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(id) })
      toast.success("Đã xóa task")
    },
    onError: (error: Error) => {
      toast.error("Lỗi xóa task", {
        description: error.message,
      })
    },
  })
}

// ==================== USERS ====================

interface UserFilters {
  search?: string
  department?: string
  role?: string
  status?: string
}

// Fetch all users
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(JSON.stringify(filters)),
    queryFn: async () => {
      await delay(400)
      
      let users = [...mockUsers]
      
      // Apply filters
      if (filters.search) {
        users = users.filter((u) =>
          u.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          u.email.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }
      
      if (filters.department) {
        users = users.filter((u) => u.department === filters.department)
      }
      
      if (filters.role) {
        users = users.filter((u) => u.roles.includes(filters.role as any))
      }
      
      if (filters.status) {
        users = users.filter((u) => u.status === filters.status)
      }
      
      return users
    },
  })
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      await delay(300)
      const user = mockUsers.find((u) => u.id === id)
      if (!user) throw new Error("User not found")
      return user
    },
    enabled: !!id,
  })
}

// Fetch current user profile
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      await delay(300)
      // Return first user as current user (in real app, get from auth)
      return mockUsers[0]
    },
  })
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      await delay(600)
      const user = mockUsers.find((u) => u.id === id)
      if (!user) throw new Error("User not found")
      
      const updatedUser = { ...user, ...data }
      return updatedUser
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser)
      toast.success("Đã cập nhật thông tin người dùng")
    },
    onError: (error: Error) => {
      toast.error("Lỗi cập nhật người dùng", {
        description: error.message,
      })
    },
  })
}
