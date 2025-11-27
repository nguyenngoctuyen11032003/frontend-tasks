import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { User } from "@/types"
import { toast } from "sonner"

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => api.getUsers(),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.getUser(id),
    enabled: !!id,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => api.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      toast.success("Cập nhật người dùng thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật người dùng thất bại")
    },
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => api.search(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}
