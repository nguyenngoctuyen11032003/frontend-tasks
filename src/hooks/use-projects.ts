import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Project } from "@/types"
import { toast } from "sonner"

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// Hooks
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => api.getProjects(),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => api.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Project>) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Tạo dự án thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo dự án thất bại")
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => api.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Cập nhật dự án thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật dự án thất bại")
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      toast.success("Xóa dự án thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa dự án thất bại")
    },
  })
}
