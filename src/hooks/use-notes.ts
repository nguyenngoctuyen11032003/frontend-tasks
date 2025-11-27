import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { Note } from "@/types"
import { toast } from "sonner"

// Query keys
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
}

// Hooks
export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: () => api.getNotes(),
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => api.getNote(id),
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Note>) => api.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success("Tạo ghi chú thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo ghi chú thất bại")
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => api.updateNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success("Cập nhật ghi chú thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật ghi chú thất bại")
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() })
      toast.success("Xóa ghi chú thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa ghi chú thất bại")
    },
  })
}
