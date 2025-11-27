import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Task, TaskStatus } from "@/types"
import { toast } from "sonner"

// Query keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters?: { projectId?: string; status?: string; assignee?: string; page?: number }) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

// Hooks
export function useTasks(filters?: { projectId?: string; status?: string; assignee?: string; page?: number }) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => api.getTasks(filters),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => api.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Task>) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success("Tạo công việc thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo công việc thất bại")
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => api.updateTask(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) })

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData(taskKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) => {
        if (!old) return old
        return { ...old, ...data }
      })

      return { previousTask }
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask)
      }
      toast.error(error.message || "Cập nhật công việc thất bại")
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => api.updateTask(id, { status }),
    // Optimistic update
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const previousTasks = queryClient.getQueryData(taskKeys.lists())

      // Update all task list queries
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old) return old
        if (old.items) {
          // Paginated response
          return {
            ...old,
            items: old.items.map((task: Task) => (task.id === id ? { ...task, status } : task)),
          }
        }
        // Simple array
        return old.map((task: Task) => (task.id === id ? { ...task, status } : task))
      })

      return { previousTasks }
    },
    onError: (error: Error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks)
      }
      toast.error(error.message || "Cập nhật trạng thái thất bại")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      toast.success("Xóa công việc thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa công việc thất bại")
    },
  })
}
