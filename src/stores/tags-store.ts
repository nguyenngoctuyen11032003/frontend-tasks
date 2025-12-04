import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Tag } from '@/types'
import { TagsService } from '@/services/tags.service'

export interface TagsState {
  tags: Tag[]
  loading: boolean
  error: string | null
  searchQuery: string
  selectedTags: Tag[]
  
  // Async Actions
  fetchTags: () => Promise<void>
  searchTags: (query: string) => Promise<Tag[]>
  createTag: (data: { name: string; color: string }) => Promise<Tag>
  updateTag: (id: string, data: Partial<{ name: string; color: string }>) => Promise<Tag>
  deleteTag: (id: string) => Promise<void>
  
  // Sync Actions
  setTags: (tags: Tag[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  addSelectedTag: (tag: Tag) => void
  removeSelectedTag: (tagId: string) => void
  clearSelectedTags: () => void
  setSelectedTags: (tags: Tag[]) => void
  
  // Utility
  getTagById: (id: string) => Tag | undefined
  getTagsByIds: (ids: string[]) => Tag[]
  hasTag: (tagId: string) => boolean
}

const useTagsStore = create<TagsState>()(
  devtools(
    persist(
      (set, get) => ({
        tags: [],
        loading: false,
        error: null,
        searchQuery: '',
        selectedTags: [],

        // =============== ASYNC ACTIONS ===============
        fetchTags: async () => {
          set({ loading: true, error: null })
          try {
            const tags = await TagsService.getTags()
            set({ tags, loading: false })
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch tags'
            set({ error: message, loading: false })
            throw error
          }
        },

        searchTags: async (query: string) => {
          if (!query.trim()) {
            return get().tags
          }
          
          try {
            const results = await TagsService.getTags()
            return results.filter(tag =>
              tag.name.toLowerCase().includes(query.toLowerCase())
            )
          } catch (error) {
            console.error('Failed to search tags:', error)
            return []
          }
        },

        createTag: async (data: { name: string; color: string }) => {
          set({ loading: true, error: null })
          try {
            const newTag = await TagsService.createTag(data)
            set(state => ({
              tags: [...state.tags, newTag],
              loading: false
            }))
            return newTag
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create tag'
            set({ error: message, loading: false })
            throw error
          }
        },

        updateTag: async (id: string, data: Partial<{ name: string; color: string }>) => {
          set({ loading: true, error: null })
          try {
            const updatedTag = await TagsService.updateTag(id, data)
            set(state => ({
              tags: state.tags.map(tag => tag.id === id ? updatedTag : tag),
              loading: false
            }))
            return updatedTag
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update tag'
            set({ error: message, loading: false })
            throw error
          }
        },

        deleteTag: async (id: string) => {
          set({ loading: true, error: null })
          try {
            await TagsService.deleteTag(id)
            set(state => ({
              tags: state.tags.filter(tag => tag.id !== id),
              selectedTags: state.selectedTags.filter(tag => tag.id !== id),
              loading: false
            }))
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete tag'
            set({ error: message, loading: false })
            throw error
          }
        },

        // =============== SYNC ACTIONS ===============
        setTags: (tags: Tag[]) => set({ tags }),

        setLoading: (loading: boolean) => set({ loading }),

        setError: (error: string | null) => set({ error }),

        setSearchQuery: (query: string) => set({ searchQuery: query }),

        addSelectedTag: (tag: Tag) => {
          set(state => {
            const exists = state.selectedTags.some(t => t.id === tag.id)
            return {
              selectedTags: exists ? state.selectedTags : [...state.selectedTags, tag]
            }
          })
        },

        removeSelectedTag: (tagId: string) => {
          set(state => ({
            selectedTags: state.selectedTags.filter(tag => tag.id !== tagId)
          }))
        },

        clearSelectedTags: () => set({ selectedTags: [] }),

        setSelectedTags: (tags: Tag[]) => set({ selectedTags: tags }),

        // =============== UTILITY METHODS ===============
        getTagById: (id: string) => {
          return get().tags.find(tag => tag.id === id)
        },

        getTagsByIds: (ids: string[]) => {
          const tags = get().tags
          return ids.map(id => tags.find(tag => tag.id === id)).filter(Boolean) as Tag[]
        },

        hasTag: (tagId: string) => {
          return get().selectedTags.some(tag => tag.id === tagId)
        }
      }),
      {
        name: 'tags-store',
        version: 1,
        partialize: (state) => ({
          tags: state.tags,
          selectedTags: state.selectedTags
        })
      }
    ),
    { name: 'TagsStore' }
  )
)

export { useTagsStore }
