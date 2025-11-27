"use client"

import { useSocketUserStatus } from "@/hooks/use-socket"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-client"
import { useEffect } from "react"

/**
 * Sync user online/offline status with React Query cache
 */
export function usePresenceSync() {
  const { onlineUsers } = useSocketUserStatus()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Update online users in cache
    queryClient.setQueryData(queryKeys.users.all, (oldData: any) => {
      if (!oldData) return oldData

      return oldData.map((user: any) => ({
        ...user,
        isOnline: onlineUsers.includes(user.id),
      }))
    })
  }, [onlineUsers, queryClient])

  return { onlineUsers }
}

/**
 * Hook to check if a specific user is online
 */
export function useUserOnlineStatus(userId: string) {
  const { onlineUsers } = usePresenceSync()
  return onlineUsers.includes(userId)
}
