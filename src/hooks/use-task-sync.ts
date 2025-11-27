import { useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { useSocketTaskUpdates } from "@/hooks/use-socket"
import { toast } from "sonner"
import type { Task } from "@/types"

/**
 * Hook to sync task updates via Socket.io with React Query cache
 * Automatically updates cache when tasks are modified by other users
 */
export function useTaskSync() {
  const queryClient = useQueryClient()

  // Listen for task updates from socket
  useSocketTaskUpdates(
    useCallback(
      ({ taskId, changes }: { taskId: string; changes: Partial<Task> }) => {
        // Update task detail cache
        queryClient.setQueryData(
          queryKeys.tasks.detail(taskId),
          (oldTask: Task | undefined) => {
            if (!oldTask) return oldTask
            return { ...oldTask, ...changes, updatedAt: new Date().toISOString() }
          }
        )

        // Invalidate task lists to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() })

        // Show toast notification
        if (changes.status) {
          toast.info("Task đã được cập nhật", {
            description: `Trạng thái: ${changes.status}`,
          })
        }
      },
      [queryClient]
    )
  )
}

/**
 * Hook to emit task updates to socket when local changes are made
 */
export function useEmitTaskUpdate() {
  const { socketClient } = useSocket()

  return useCallback(
    (taskId: string, changes: Partial<Task>) => {
      if (socketClient?.isConnected()) {
        socketClient.emit("task:update", { taskId, changes })
      }
    },
    [socketClient]
  )
}

/**
 * Hook for real-time task collaboration
 * Combines socket sync with emit capabilities
 */
export function useTaskCollaboration() {
  useTaskSync()
  const emitUpdate = useEmitTaskUpdate()

  return {
    emitTaskUpdate: emitUpdate,
  }
}

// Re-export from use-socket for convenience
import { useSocket } from "@/hooks/use-socket"
