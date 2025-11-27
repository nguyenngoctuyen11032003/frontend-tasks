import { QueryClient, DefaultOptions } from "@tanstack/react-query"

// Default options for all queries
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 3 times
    retry: 3,
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === "production",
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    // Retry delay: 1 second
    retryDelay: 1000,
  },
}

// Create a singleton query client
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

// Query keys for better organization and type safety
export const queryKeys = {
  // Projects
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (filters: string) => [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    members: (id: string) => [...queryKeys.projects.detail(id), "members"] as const,
    tasks: (id: string) => [...queryKeys.projects.detail(id), "tasks"] as const,
  },
  // Tasks
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: string) => [...queryKeys.tasks.lists(), { filters }] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    comments: (id: string) => [...queryKeys.tasks.detail(id), "comments"] as const,
    subtasks: (id: string) => [...queryKeys.tasks.detail(id), "subtasks"] as const,
  },
  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },
  // Teams
  teams: {
    all: ["teams"] as const,
    lists: () => [...queryKeys.teams.all, "list"] as const,
    list: (filters: string) => [...queryKeys.teams.lists(), { filters }] as const,
    details: () => [...queryKeys.teams.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    members: (id: string) => [...queryKeys.teams.detail(id), "members"] as const,
  },
  // Chat
  chat: {
    all: ["chat"] as const,
    rooms: () => [...queryKeys.chat.all, "rooms"] as const,
    room: (id: string) => [...queryKeys.chat.all, "room", id] as const,
    messages: (roomId: string) => [...queryKeys.chat.room(roomId), "messages"] as const,
  },
  // Notes
  notes: {
    all: ["notes"] as const,
    lists: () => [...queryKeys.notes.all, "list"] as const,
    list: (filters: string) => [...queryKeys.notes.lists(), { filters }] as const,
    details: () => [...queryKeys.notes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.notes.details(), id] as const,
  },
  // Reports
  reports: {
    all: ["reports"] as const,
    lists: () => [...queryKeys.reports.all, "list"] as const,
    list: (filters: string) => [...queryKeys.reports.lists(), { filters }] as const,
    details: () => [...queryKeys.reports.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.reports.details(), id] as const,
  },
  // Notifications
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
  },
  // Dashboard
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    activity: () => [...queryKeys.dashboard.all, "activity"] as const,
    charts: () => [...queryKeys.dashboard.all, "charts"] as const,
  },
} as const
