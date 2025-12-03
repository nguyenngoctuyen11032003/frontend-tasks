import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {
  tasksService,
  type CreateTaskPayload,
  type UpdateTaskPayload,
  type QueryTaskParams,
  type TaskStatistics,
  type CreateChecklistItemPayload,
  type UpdateChecklistItemPayload,
  type CreateReminderPayload,
  type CreateCommentPayload,
  type UpdateCommentPayload,
  type AddReactionPayload,
} from "@/services/tasks.service"
import type { Task, ChecklistItem, TaskReminder, Comment } from "@/types"

interface TaskFilters {
  status?: string
  priority?: string
  projectId?: string
  assigneeId?: string
  createdById?: string
  tagId?: string
  dueDateFrom?: string
  dueDateTo?: string
  overdue?: string
}

interface TaskPagination {
  page: number
  limit: number
  total: number
}

interface TasksStore {
  // State
  tasks: Task[]
  selectedTask: Task | null
  loading: boolean
  error: string | null
  searchQuery: string
  filters: TaskFilters
  pagination: TaskPagination
  statistics: TaskStatistics | null

  // Loading states for specific operations
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
  loadingTaskId: string | null

  // Actions
  setTasks: (tasks: Task[]) => void
  setSelectedTask: (task: Task | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: TaskFilters) => void
  setPagination: (pagination: Partial<TaskPagination>) => void
  setStatistics: (stats: TaskStatistics | null) => void

  // CRUD Operations
  fetchTasks: (params?: QueryTaskParams) => Promise<void>
  fetchTask: (id: string) => Promise<void>
  createTask: (payload: CreateTaskPayload) => Promise<Task>
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>
  deleteTask: (id: string) => Promise<void>

  // Assignees Management
  assignUsers: (taskId: string, userIds: string[]) => Promise<void>
  removeAssignee: (taskId: string, assigneeId: string) => Promise<void>

  // Tags Management
  addTags: (taskId: string, tagIds: string[]) => Promise<void>
  removeTag: (taskId: string, tagId: string) => Promise<void>

  // Checklist Management
  addChecklistItem: (taskId: string, payload: CreateChecklistItemPayload) => Promise<void>
  updateChecklistItem: (taskId: string, itemId: string, payload: UpdateChecklistItemPayload) => Promise<void>
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>

  // Reminders Management
  addReminder: (taskId: string, payload: CreateReminderPayload) => Promise<void>
  removeReminder: (taskId: string, reminderId: string) => Promise<void>

  // Comments Management
  addComment: (taskId: string, payload: CreateCommentPayload) => Promise<void>
  updateComment: (taskId: string, commentId: string, payload: UpdateCommentPayload) => Promise<void>
  removeComment: (taskId: string, commentId: string) => Promise<void>

  // Reactions Management
  addReaction: (commentId: string, payload: AddReactionPayload) => Promise<void>
  removeReaction: (commentId: string, reactionId: string) => Promise<void>

  // Statistics
  fetchStatistics: (projectId?: string) => Promise<void>

  // Selectors
  getTask: (id: string) => Task | undefined
  getFilteredTasks: () => Task[]
  hasPermission: (action: string) => boolean
  canManageTask: (taskId: string) => boolean
  isEmpty: () => boolean
}

const defaultPagination: TaskPagination = {
  page: 1,
  limit: 20,
  total: 0,
}

export const useTasksStore = create<TasksStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        tasks: [],
        selectedTask: null,
        loading: false,
        error: null,
        searchQuery: "",
        filters: {},
        pagination: defaultPagination,
        statistics: null,
        createLoading: false,
        updateLoading: false,
        deleteLoading: false,
        loadingTaskId: null,

        // Setters
        setTasks: (tasks) => set({ tasks }),
        setSelectedTask: (task) => set({ selectedTask: task }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter change
          })),
        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),
        setStatistics: (stats) => set({ statistics: stats }),

        // CRUD Operations
        fetchTasks: async (params?: QueryTaskParams) => {
          try {
            set({ loading: true, error: null })
            const state = get()

            const queryParams: QueryTaskParams = {
              page: state.pagination.page,
              limit: state.pagination.limit,
              search: state.searchQuery,
              ...state.filters,
              ...params,
            }

            const response = await tasksService.getTasks(queryParams)

            set({
              tasks: response.data,
              pagination: {
                page: response.page,
                limit: response.limit,
                total: response.total,
              },
              loading: false,
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch tasks"
            set({ error: errorMessage, loading: false })
            throw error
          }
        },

        fetchTask: async (id: string) => {
          try {
            set({ loadingTaskId: id })
            const task = await tasksService.getTask(id)
            set({ selectedTask: task, loadingTaskId: null })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch task"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        createTask: async (payload: CreateTaskPayload) => {
          try {
            set({ createLoading: true, error: null })
            const task = await tasksService.createTask(payload)

            // Add to tasks list
            const state = get()
            set({
              tasks: [task, ...state.tasks],
              createLoading: false,
            })

            return task
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to create task"
            set({ error: errorMessage, createLoading: false })
            throw error
          }
        },

        updateTask: async (id: string, payload: UpdateTaskPayload) => {
          try {
            set({ updateLoading: true, loadingTaskId: id, error: null })
            const updatedTask = await tasksService.updateTask(id, payload)

            // Update in tasks list and selected task
            set((state) => {
              const updatedTasks = state.tasks.map((t) =>
                t.id === id ? updatedTask : t
              )
              return {
                tasks: updatedTasks,
                selectedTask:
                  state.selectedTask?.id === id
                    ? updatedTask
                    : state.selectedTask,
                updateLoading: false,
                loadingTaskId: null,
              }
            })

            return updatedTask
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update task"
            set({
              error: errorMessage,
              updateLoading: false,
              loadingTaskId: null,
            })
            throw error
          }
        },

        deleteTask: async (id: string) => {
          try {
            set({ deleteLoading: true, loadingTaskId: id, error: null })
            await tasksService.deleteTask(id)

            // Remove from tasks list
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== id),
              selectedTask:
                state.selectedTask?.id === id ? null : state.selectedTask,
              deleteLoading: false,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete task"
            set({
              error: errorMessage,
              deleteLoading: false,
              loadingTaskId: null,
            })
            throw error
          }
        },

        // Assignees Management
        assignUsers: async (taskId: string, userIds: string[]) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            const updatedTask = await tasksService.assignUsers(taskId, userIds)

            // Update in store
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              selectedTask:
                state.selectedTask?.id === taskId
                  ? updatedTask
                  : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to assign users"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        removeAssignee: async (taskId: string, assigneeId: string) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            const updatedTask = await tasksService.removeAssignee(
              taskId,
              assigneeId
            )

            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              selectedTask:
                state.selectedTask?.id === taskId
                  ? updatedTask
                  : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove assignee"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        // Tags Management
        addTags: async (taskId: string, tagIds: string[]) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            const updatedTask = await tasksService.addTags(taskId, tagIds)

            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              selectedTask:
                state.selectedTask?.id === taskId
                  ? updatedTask
                  : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add tags"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        removeTag: async (taskId: string, tagId: string) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            const updatedTask = await tasksService.removeTag(taskId, tagId)

            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              selectedTask:
                state.selectedTask?.id === taskId
                  ? updatedTask
                  : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to remove tag"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        // Checklist Management
        addChecklistItem: async (
          taskId: string,
          payload: CreateChecklistItemPayload
        ) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.addChecklistItem(taskId, payload)

            // Refresh task to get updated checklist
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to add checklist item"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        updateChecklistItem: async (
          taskId: string,
          itemId: string,
          payload: UpdateChecklistItemPayload
        ) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.updateChecklistItem(taskId, itemId, payload)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update checklist item"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        removeChecklistItem: async (taskId: string, itemId: string) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.removeChecklistItem(taskId, itemId)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove checklist item"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        // Reminders Management
        addReminder: async (
          taskId: string,
          payload: CreateReminderPayload
        ) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.addReminder(taskId, payload)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add reminder"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        removeReminder: async (taskId: string, reminderId: string) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.removeReminder(taskId, reminderId)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove reminder"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        // Comments Management
        addComment: async (
          taskId: string,
          payload: CreateCommentPayload
        ) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.addComment(taskId, payload)

            // Refresh task to get updated comments
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add comment"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        updateComment: async (
          taskId: string,
          commentId: string,
          payload: UpdateCommentPayload
        ) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.updateComment(taskId, commentId, payload)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update comment"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        removeComment: async (taskId: string, commentId: string) => {
          try {
            set({ loadingTaskId: taskId, error: null })
            await tasksService.removeComment(taskId, commentId)

            // Refresh task
            const task = await tasksService.getTask(taskId)
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
              selectedTask:
                state.selectedTask?.id === taskId ? task : state.selectedTask,
              loadingTaskId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove comment"
            set({ error: errorMessage, loadingTaskId: null })
            throw error
          }
        },

        // Reactions Management
        addReaction: async (
          commentId: string,
          payload: AddReactionPayload
        ) => {
          try {
            set({ error: null })
            await tasksService.addReaction(commentId, payload)

            // Refresh selected task if it exists
            const state = get()
            if (state.selectedTask) {
              const task = await tasksService.getTask(state.selectedTask.id)
              set({ selectedTask: task })
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add reaction"
            set({ error: errorMessage })
            throw error
          }
        },

        removeReaction: async (commentId: string, reactionId: string) => {
          try {
            set({ error: null })
            await tasksService.removeReaction(commentId, reactionId)

            // Refresh selected task if it exists
            const state = get()
            if (state.selectedTask) {
              const task = await tasksService.getTask(state.selectedTask.id)
              set({ selectedTask: task })
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove reaction"
            set({ error: errorMessage })
            throw error
          }
        },

        // Statistics
        fetchStatistics: async (projectId?: string) => {
          try {
            const stats = await tasksService.getStatistics(projectId)
            set({ statistics: stats })
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch statistics"
            set({ error: errorMessage })
            throw error
          }
        },

        // Selectors
        getTask: (id: string) => {
          return get().tasks.find((t) => t.id === id)
        },

        getFilteredTasks: () => {
          const state = get()
          let filtered = [...state.tasks]

          // Apply search
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase()
            filtered = filtered.filter(
              (t) =>
                t.title.toLowerCase().includes(query) ||
                t.description.toLowerCase().includes(query)
            )
          }

          // Apply filters
          if (state.filters.status) {
            filtered = filtered.filter((t) => t.status === state.filters.status)
          }

          if (state.filters.priority) {
            filtered = filtered.filter(
              (t) => t.priority === state.filters.priority
            )
          }

          if (state.filters.projectId) {
            filtered = filtered.filter(
              (t) => t.projectId === state.filters.projectId
            )
          }

          if (state.filters.assigneeId) {
            filtered = filtered.filter((t) =>
              t.assignees.some((a) => a.id === state.filters.assigneeId)
            )
          }

          if (state.filters.tagId) {
            filtered = filtered.filter((t) =>
              t.tags.some((tag) => tag.id === state.filters.tagId)
            )
          }

          return filtered
        },

        hasPermission: (action: string) => {
          // This would be checked against user permissions from auth store
          // For now, return true, but should be implemented with proper permission check
          return true
        },

        canManageTask: (taskId: string) => {
          // Check if current user is assignee or creator of the task
          // Should be implemented with proper permission check
          return true
        },

        isEmpty: () => {
          return get().tasks.length === 0
        },
      }),
      {
        name: "tasks-store",
        partialize: (state) => ({
          searchQuery: state.searchQuery,
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    )
  )
)
