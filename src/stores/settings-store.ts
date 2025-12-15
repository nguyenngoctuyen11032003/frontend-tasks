import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import { SettingsService } from "@/services/settings.service"
import type {
  Theme,
  UserSettings,
  CreateThemeDto,
  UpdateThemeDto,
  UpdateUserSettingsDto,
  SystemDefaults,
} from "@/services/settings.service"

interface SettingsState {
  // Data
  userSettings: UserSettings | null
  themes: Theme[]
  systemDefaults: SystemDefaults | null
  
  // Loading states
  loading: boolean
  themesLoading: boolean
  
  // Error state
  error: string | null
  
  // Actions - User Settings
  fetchUserSettings: () => Promise<void>
  updateUserSettings: (data: UpdateUserSettingsDto) => Promise<UserSettings>
  
  // Actions - Themes
  fetchThemes: () => Promise<void>
  fetchTheme: (id: string) => Promise<Theme>
  createTheme: (data: CreateThemeDto) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeDto) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
  
  // Actions - System
  fetchSystemDefaults: () => Promise<void>
  
  // Helpers
  clearError: () => void
  reset: () => void
}

const initialState = {
  userSettings: null,
  themes: [],
  systemDefaults: null,
  loading: false,
  themesLoading: false,
  error: null,
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Fetch user settings
        fetchUserSettings: async () => {
          set({ loading: true, error: null })
          try {
            const settings = await SettingsService.getUserSettings()
            set({
              userSettings: settings,
              loading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch user settings"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Update user settings
        updateUserSettings: async (data: UpdateUserSettingsDto) => {
          set({ loading: true, error: null })
          try {
            const updatedSettings = await SettingsService.updateUserSettings(data)
            set({
              userSettings: updatedSettings,
              loading: false,
            })
            return updatedSettings
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update user settings"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Fetch all themes
        fetchThemes: async () => {
          set({ themesLoading: true, error: null })
          try {
            const themes = await SettingsService.getAllThemes()
            set({
              themes,
              themesLoading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch themes"
            set({ error: message, themesLoading: false, themes: [] })
            throw error
          }
        },

        // Fetch single theme
        fetchTheme: async (id: string) => {
          set({ themesLoading: true, error: null })
          try {
            const theme = await SettingsService.getTheme(id)
            set({ themesLoading: false })
            return theme
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch theme"
            set({ error: message, themesLoading: false })
            throw error
          }
        },

        // Create new theme
        createTheme: async (data: CreateThemeDto) => {
          set({ themesLoading: true, error: null })
          try {
            const newTheme = await SettingsService.createTheme(data)
            set((state) => ({
              themes: [...state.themes, newTheme],
              themesLoading: false,
            }))
            return newTheme
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create theme"
            set({ error: message, themesLoading: false })
            throw error
          }
        },

        // Update theme
        updateTheme: async (id: string, data: UpdateThemeDto) => {
          set({ themesLoading: true, error: null })
          try {
            const updatedTheme = await SettingsService.updateTheme(id, data)
            set((state) => ({
              themes: state.themes.map((t) => (t.id === id ? updatedTheme : t)),
              themesLoading: false,
            }))
            return updatedTheme
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update theme"
            set({ error: message, themesLoading: false })
            throw error
          }
        },

        // Delete theme
        deleteTheme: async (id: string) => {
          set({ themesLoading: true, error: null })
          try {
            await SettingsService.deleteTheme(id)
            set((state) => ({
              themes: state.themes.filter((t) => t.id !== id),
              themesLoading: false,
            }))
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete theme"
            set({ error: message, themesLoading: false })
            throw error
          }
        },

        // Fetch system defaults
        fetchSystemDefaults: async () => {
          set({ loading: true, error: null })
          try {
            const defaults = await SettingsService.getSystemDefaults()
            set({
              systemDefaults: defaults,
              loading: false,
            })
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch system defaults"
            set({ error: message, loading: false })
            throw error
          }
        },

        // Clear error
        clearError: () => set({ error: null }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: "settings-storage",
        partialize: (state) => ({
          // Persist user settings and themes
          userSettings: state.userSettings,
          themes: state.themes,
        }),
      }
    )
  )
)
