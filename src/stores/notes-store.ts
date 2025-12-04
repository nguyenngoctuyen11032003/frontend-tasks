import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import {
  notesService,
  type CreateNotePayload,
  type UpdateNotePayload,
  type QueryNoteParams,
  type NoteStatistics,
} from "@/services/notes.service"
import type { Note } from "@/types"

interface NoteFilters {
  tagId?: string
  isPinned?: boolean
  isShared?: boolean
}

interface NotePagination {
  page: number
  limit: number
  total: number
}

interface NotesStore {
  // State
  notes: Note[]
  selectedNote: Note | null
  loading: boolean
  error: string | null
  searchQuery: string
  filters: NoteFilters
  pagination: NotePagination
  statistics: NoteStatistics | null

  // Loading states for specific operations
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean
  loadingNoteId: string | null

  // Actions
  setNotes: (notes: Note[]) => void
  setSelectedNote: (note: Note | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: NoteFilters) => void
  setPagination: (pagination: Partial<NotePagination>) => void
  setStatistics: (stats: NoteStatistics | null) => void
  clearFilters: () => void

  // CRUD Operations
  fetchNotes: (params?: QueryNoteParams) => Promise<void>
  fetchNote: (id: string) => Promise<void>
  createNote: (payload: CreateNotePayload) => Promise<Note>
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note>
  deleteNote: (id: string) => Promise<void>

  // Note Operations
  duplicateNote: (id: string) => Promise<Note>
  togglePin: (id: string) => Promise<Note>
  shareNote: (id: string, userIds: string[]) => Promise<Note>
  unshareNote: (id: string, userId: string) => Promise<Note>

  // Tags Management
  addTag: (noteId: string, tagId: string) => Promise<Note>
  removeTag: (noteId: string, tagId: string) => Promise<Note>

  // Selectors
  getNote: (id: string) => Note | undefined
  getFilteredNotes: () => Note[]
  getPinnedNotes: () => Note[]
  getSharedNotes: () => Note[]
  isEmpty: () => boolean
}

const defaultPagination: NotePagination = {
  page: 1,
  limit: 12,
  total: 0,
}

export const useNotesStore = create<NotesStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        notes: [],
        selectedNote: null,
        loading: false,
        error: null,
        searchQuery: "",
        filters: {},
        pagination: defaultPagination,
        statistics: null,
        createLoading: false,
        updateLoading: false,
        deleteLoading: false,
        loadingNoteId: null,

        // Setters
        setNotes: (notes) => set({ notes }),
        setSelectedNote: (note) => set({ selectedNote: note }),
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
        clearFilters: () =>
          set({
            filters: {},
            searchQuery: "",
            pagination: { ...defaultPagination },
          }),

        // CRUD Operations
        fetchNotes: async (params?: QueryNoteParams) => {
          try {
            set({ loading: true, error: null })
            const state = get()

            const queryParams: QueryNoteParams = {
              page: state.pagination.page,
              limit: state.pagination.limit,
              search: state.searchQuery,
              ...state.filters,
              ...params,
            }

            const response = await notesService.getNotes(queryParams)

            set({
              notes: response.items,
              pagination: {
                page: response.page,
                limit: response.limit,
                total: response.total,
              },
              loading: false,
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch notes"
            set({ error: errorMessage, loading: false })
            throw error
          }
        },

        fetchNote: async (id: string) => {
          try {
            set({ loadingNoteId: id })
            const note = await notesService.getNote(id)
            set({ selectedNote: note, loadingNoteId: null })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to fetch note"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        createNote: async (payload: CreateNotePayload) => {
          try {
            set({ createLoading: true, error: null })
            const note = await notesService.createNote(payload)

            // Add to notes list
            const state = get()
            set({
              notes: [note, ...state.notes],
              createLoading: false,
            })

            return note
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to create note"
            set({ error: errorMessage, createLoading: false })
            throw error
          }
        },

        updateNote: async (id: string, payload: UpdateNotePayload) => {
          try {
            set({ updateLoading: true, loadingNoteId: id, error: null })
            const updatedNote = await notesService.updateNote(id, payload)

            // Update in notes list and selected note
            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === id ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === id ? updatedNote : state.selectedNote,
                updateLoading: false,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update note"
            set({
              error: errorMessage,
              updateLoading: false,
              loadingNoteId: null,
            })
            throw error
          }
        },

        deleteNote: async (id: string) => {
          try {
            set({ deleteLoading: true, loadingNoteId: id, error: null })
            await notesService.deleteNote(id)

            // Remove from notes list
            set((state) => ({
              notes: state.notes.filter((n) => n.id !== id),
              selectedNote:
                state.selectedNote?.id === id ? null : state.selectedNote,
              deleteLoading: false,
              loadingNoteId: null,
            }))
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete note"
            set({
              error: errorMessage,
              deleteLoading: false,
              loadingNoteId: null,
            })
            throw error
          }
        },

        // Note Operations
        duplicateNote: async (id: string) => {
          try {
            set({ loadingNoteId: id, error: null })
            const duplicatedNote = await notesService.duplicateNote(id)

            set((state) => ({
              notes: [duplicatedNote, ...state.notes],
              loadingNoteId: null,
            }))

            return duplicatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to duplicate note"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        togglePin: async (id: string) => {
          try {
            set({ loadingNoteId: id, error: null })
            const updatedNote = await notesService.togglePin(id)

            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === id ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === id ? updatedNote : state.selectedNote,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to toggle pin"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        shareNote: async (id: string, userIds: string[]) => {
          try {
            set({ loadingNoteId: id, error: null })
            const updatedNote = await notesService.shareNote(id, userIds)

            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === id ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === id ? updatedNote : state.selectedNote,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to share note"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        unshareNote: async (id: string, userId: string) => {
          try {
            set({ loadingNoteId: id, error: null })
            const updatedNote = await notesService.unshareNote(id, userId)

            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === id ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === id ? updatedNote : state.selectedNote,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to unshare note"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        // Tags Management
        addTag: async (noteId: string, tagId: string) => {
          try {
            set({ loadingNoteId: noteId, error: null })
            const updatedNote = await notesService.addTag(noteId, tagId)

            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === noteId ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === noteId
                    ? updatedNote
                    : state.selectedNote,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to add tag"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        removeTag: async (noteId: string, tagId: string) => {
          try {
            set({ loadingNoteId: noteId, error: null })
            const updatedNote = await notesService.removeTag(noteId, tagId)

            set((state) => {
              const updatedNotes = state.notes.map((n) =>
                n.id === noteId ? updatedNote : n
              )
              return {
                notes: updatedNotes,
                selectedNote:
                  state.selectedNote?.id === noteId
                    ? updatedNote
                    : state.selectedNote,
                loadingNoteId: null,
              }
            })

            return updatedNote
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to remove tag"
            set({ error: errorMessage, loadingNoteId: null })
            throw error
          }
        },

        // Selectors
        getNote: (id: string) => {
          return get().notes.find((n) => n.id === id)
        },

        getFilteredNotes: () => {
          const state = get()
          let filtered = [...state.notes]

          // Apply search
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase()
            filtered = filtered.filter(
              (n) =>
                n.title.toLowerCase().includes(query) ||
                n.content.toLowerCase().includes(query)
            )
          }

          // Apply filters
          if (state.filters.tagId) {
            filtered = filtered.filter((n) =>
              (n.tags || []).includes(state.filters.tagId!)
            )
          }

          if (state.filters.isPinned !== undefined) {
            filtered = filtered.filter((n) => n.isPinned === state.filters.isPinned)
          }

          if (state.filters.isShared !== undefined) {
            filtered = filtered.filter((n) => n.isShared === state.filters.isShared)
          }

          return filtered
        },

        getPinnedNotes: () => {
          return get().notes.filter((n) => n.isPinned)
        },

        getSharedNotes: () => {
          return get().notes.filter((n) => n.isShared)
        },

        isEmpty: () => {
          return get().notes.length === 0
        },
      }),
      {
        name: "notes-store",
        partialize: (state) => ({
          // Do NOT persist filters to avoid filter persistence issue
          // Only persist selected note and statistics
          selectedNote: state.selectedNote,
          statistics: state.statistics,
        }),
      }
    )
  )
)
