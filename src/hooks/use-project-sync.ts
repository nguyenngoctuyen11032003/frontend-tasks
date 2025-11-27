"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { useSocketProjectUpdates } from "@/hooks/use-socket"
import { socketClient } from "@/lib/socket"
import { toast } from "sonner"

/**
 * Sync project updates from socket to React Query cache
 */
export function useProjectSync() {
  const queryClient = useQueryClient()

  useSocketProjectUpdates((project: any) => {
    // Update project detail in cache
    queryClient.setQueryData(queryKeys.projects.detail(project.id), project)

    // Invalidate project lists to refetch
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })

    // Show toast notification
    toast.info("Cập nhật dự án", {
      description: `Dự án "${project.name}" đã được cập nhật`,
    })
  })
}

/**
 * Emit project update to socket server
 */
export function useEmitProjectUpdate() {
  const emitProjectUpdate = (projectId: string, changes: any) => {
    if (socketClient.isConnected()) {
      socketClient.emit("project:update", { projectId, changes })
    }
  }

  return emitProjectUpdate
}

/**
 * Combined hook for project real-time collaboration
 */
export function useProjectCollaboration() {
  useProjectSync()
  const emitProjectUpdate = useEmitProjectUpdate()

  return { emitProjectUpdate }
}
