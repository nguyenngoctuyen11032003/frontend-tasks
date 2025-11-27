import type React from "react"
import { create } from "zustand"

interface UIStore {
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  rightPanelContent: React.ReactNode | null
  chatDrawerOpen: boolean
  theme: "light" | "dark" | "system"
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openRightPanel: (content: React.ReactNode) => void
  closeRightPanel: () => void
  toggleChatDrawer: () => void
  setChatDrawerOpen: (open: boolean) => void
  setTheme: (theme: "light" | "dark" | "system") => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  rightPanelOpen: false,
  rightPanelContent: null,
  chatDrawerOpen: false,
  theme: "system",

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openRightPanel: (content) => set({ rightPanelOpen: true, rightPanelContent: content }),

  closeRightPanel: () => set({ rightPanelOpen: false, rightPanelContent: null }),

  toggleChatDrawer: () => set((state) => ({ chatDrawerOpen: !state.chatDrawerOpen })),

  setChatDrawerOpen: (open) => set({ chatDrawerOpen: open }),

  setTheme: (theme) => set({ theme }),
}))
