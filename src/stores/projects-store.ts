import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {
  projectsService,
  type CreateProjectPayload,
  type UpdateProjectPayload,
  type QueryProjectParams,
  type ProjectStatistics,
} from "@/services/projects.service"
import type { Project } from "@/types"

interface ProjectFilters {
  status?: string
  memberId?: string
  tagId?: string
  createdById?: string
}

interface ProjectPagination {
  page: number
  limit: number
  total: number
}

interface ProjectsStore {
  // State
  projects: Project[]
  selectedProject: Project | null
  loading: boolean
  error: string | null
  searchQuery: string
  filters: ProjectFilters
  pagination: ProjectPagination
  statistics: ProjectStatistics | null

  // Loading states for specific operations
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
  loadingProjectId: string | null

  // Actions
  setProjects: (projects: Project[]) => void
  setSelectedProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: ProjectFilters) => void
  setPagination: (pagination: Partial<ProjectPagination>) => void
  setStatistics: (stats: ProjectStatistics | null) => void

  // CRUD Operations
  fetchProjects: (params?: QueryProjectParams) => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (payload: CreateProjectPayload) => Promise<Project>
  updateProject: (id: string, payload: UpdateProjectPayload) => Promise<Project>
  deleteProject: (id: string) => Promise<void>

  // Members Management
  addMembers: (projectId: string, userIds: string[]) => Promise<void>
  removeMember: (projectId: string, memberId: string) => Promise<void>

  // Tags Management
  addTags: (projectId: string, tagIds: string[]) => Promise<void>
  removeTag: (projectId: string, tagId: string) => Promise<void>

  // Selectors
  getProject: (id: string) => Project | undefined
  getFilteredProjects: () => Project[]
  hasPermission: (action: string) => boolean
  canManageProject: (projectId: string) => boolean
  isEmpty: () => boolean
}

const defaultPagination: ProjectPagination = {
  page: 1,
  limit: 10,
  total: 0,
}

export const useProjectsStore = create<ProjectsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        projects: [],
        selectedProject: null,
        loading: false,
        error: null,
        searchQuery: "",
        filters: {},
        pagination: defaultPagination,
        statistics: null,
        createLoading: false,
        updateLoading: false,
        deleteLoading: false,
        loadingProjectId: null,

        // Setters
        setProjects: (projects) => set({ projects }),
        setSelectedProject: (project) => set({ selectedProject: project }),
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
        fetchProjects: async (params?: QueryProjectParams) => {
          try {
            set({ loading: true, error: null })
            const state = get()

            const queryParams: QueryProjectParams = {
              page: state.pagination.page,
              limit: state.pagination.limit,
              search: state.searchQuery,
              ...state.filters,
              ...params,
            }

            const response = await projectsService.getProjects(queryParams)

            set({
              projects: response.data,
              pagination: {
                page: response.page,
                limit: response.limit,
                total: response.total,
              },
              loading: false,
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch projects"
            set({ error: errorMessage, loading: false })
            throw error
          }
        },

        fetchProject: async (id: string) => {
          try {
            set({ loadingProjectId: id })
            const project = await projectsService.getProject(id)
            set({ selectedProject: project, loadingProjectId: null })
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch project"
            set({ error: errorMessage, loadingProjectId: null })
            throw error
          }
        },

        createProject: async (payload: CreateProjectPayload) => {
          try {
            set({ createLoading: true, error: null })
            const project = await projectsService.createProject(payload)

            // Add the new project to the list immediately (optimistic update)
            set((state) => ({
              projects: [project, ...state.projects],
              pagination: {
                ...state.pagination,
                total: state.pagination.total + 1,
              },
            }))
            
            // Then refresh to ensure we have the latest data from server
            await get().fetchProjects()
            
            set({ createLoading: false })
            return project
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create project"
            set({ error: errorMessage, createLoading: false })
            throw error
          }
        },

        updateProject: async (
          id: string,
          payload: UpdateProjectPayload
        ) => {
          try {
            set({ updateLoading: true, loadingProjectId: id, error: null })
            const updatedProject = await projectsService.updateProject(
              id,
              payload
            )

            // Update in projects list and selected project
            set((state) => {
              const updatedProjects = state.projects.map((p) =>
                p.id === id ? updatedProject : p
              )
              return {
                projects: updatedProjects,
                selectedProject:
                  state.selectedProject?.id === id
                    ? updatedProject
                    : state.selectedProject,
                updateLoading: false,
                loadingProjectId: null,
              }
            })

            return updatedProject
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update project"
            set({ error: errorMessage, updateLoading: false, loadingProjectId: null })
            throw error
          }
        },

        deleteProject: async (id: string) => {
          try {
            set({ deleteLoading: true, loadingProjectId: id, error: null })
            await projectsService.deleteProject(id)

            // Remove from projects list
            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id),
              selectedProject:
                state.selectedProject?.id === id
                  ? null
                  : state.selectedProject,
              deleteLoading: false,
              loadingProjectId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete project"
            set({
              error: errorMessage,
              deleteLoading: false,
              loadingProjectId: null,
            })
            throw error
          }
        },

        // Members Management
        addMembers: async (projectId: string, userIds: string[]) => {
          try {
            set({ loadingProjectId: projectId, error: null })
            const updatedProject = await projectsService.addMembers(
              projectId,
              userIds
            )

            // Update in store
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
              selectedProject:
                state.selectedProject?.id === projectId
                  ? updatedProject
                  : state.selectedProject,
              loadingProjectId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to add members"
            set({ error: errorMessage, loadingProjectId: null })
            throw error
          }
        },

        removeMember: async (projectId: string, memberId: string) => {
          try {
            set({ loadingProjectId: projectId, error: null })
            const updatedProject = await projectsService.removeMember(
              projectId,
              memberId
            )

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
              selectedProject:
                state.selectedProject?.id === projectId
                  ? updatedProject
                  : state.selectedProject,
              loadingProjectId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to remove member"
            set({ error: errorMessage, loadingProjectId: null })
            throw error
          }
        },

        // Tags Management
        addTags: async (projectId: string, tagIds: string[]) => {
          try {
            set({ loadingProjectId: projectId, error: null })
            const updatedProject = await projectsService.addTags(
              projectId,
              tagIds
            )

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
              selectedProject:
                state.selectedProject?.id === projectId
                  ? updatedProject
                  : state.selectedProject,
              loadingProjectId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add tags"
            set({ error: errorMessage, loadingProjectId: null })
            throw error
          }
        },

        removeTag: async (projectId: string, tagId: string) => {
          try {
            set({ loadingProjectId: projectId, error: null })
            const updatedProject = await projectsService.removeTag(
              projectId,
              tagId
            )

            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? updatedProject : p
              ),
              selectedProject:
                state.selectedProject?.id === projectId
                  ? updatedProject
                  : state.selectedProject,
              loadingProjectId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to remove tag"
            set({ error: errorMessage, loadingProjectId: null })
            throw error
          }
        },

        // Selectors
        getProject: (id: string) => {
          return get().projects.find((p) => p.id === id)
        },

        getFilteredProjects: () => {
          const state = get()
          let filtered = [...state.projects]

          // Apply search
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase()
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            )
          }

          // Apply filters
          if (state.filters.status) {
            filtered = filtered.filter((p) => p.status === state.filters.status)
          }

          if (state.filters.memberId) {
            filtered = filtered.filter((p) =>
              p.members.some((m: any) => m.id === state.filters.memberId)
            )
          }

          if (state.filters.tagId) {
            filtered = filtered.filter((p) =>
              p.tags.some((t: any) => t.id === state.filters.tagId)
            )
          }

          return filtered
        },

        hasPermission: (action: string) => {
          // This would be checked against user permissions from auth store
          // For now, return true, but should be implemented with proper permission check
          return true
        },

        canManageProject: (projectId: string) => {
          // Check if current user is owner or admin of the project
          // Should be implemented with proper permission check
          return true
        },

        isEmpty: () => {
          return get().projects.length === 0
        },
      }),
      {
        name: "projects-store",
        partialize: (state) => ({
          searchQuery: state.searchQuery,
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    )
  )
)
