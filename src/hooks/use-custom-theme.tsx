"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { CustomTheme, ThemeManager, defaultThemeColors } from "@/lib/theme"

interface ThemeContextType {
  currentTheme: CustomTheme | null
  setTheme: (themeId: string) => void
  customThemes: CustomTheme[]
  saveTheme: (theme: CustomTheme) => void
  deleteTheme: (themeId: string) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme | null>(null)
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])

  useEffect(() => {
    // Load active theme on mount
    const activeThemeId = ThemeManager.getActiveThemeId()
    if (activeThemeId) {
      const theme = ThemeManager.getThemeById(activeThemeId)
      if (theme) {
        setCurrentTheme(theme)
        ThemeManager.applyTheme(theme)
      }
    }

    // Load custom themes
    setCustomThemes(ThemeManager.getCustomThemes())
  }, [])

  const setTheme = (themeId: string) => {
    const theme = ThemeManager.getThemeById(themeId)
    if (theme) {
      setCurrentTheme(theme)
      ThemeManager.setActiveTheme(themeId)
      ThemeManager.applyTheme(theme)
    }
  }

  const saveTheme = (theme: CustomTheme) => {
    ThemeManager.saveCustomTheme(theme)
    setCustomThemes(ThemeManager.getCustomThemes())
  }

  const deleteTheme = (themeId: string) => {
    ThemeManager.deleteCustomTheme(themeId)
    setCustomThemes(ThemeManager.getCustomThemes())
    
    // If deleted theme is active, reset to default
    if (currentTheme?.id === themeId) {
      setCurrentTheme(null)
      ThemeManager.resetTheme()
    }
  }

  const resetTheme = () => {
    ThemeManager.resetTheme()
    setCurrentTheme(null)
    localStorage.removeItem("active-theme-id")
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        customThemes,
        saveTheme,
        deleteTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useCustomTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useCustomTheme must be used within a ThemeProvider")
  }
  return context
}
