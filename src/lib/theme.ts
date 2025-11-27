/**
 * Theme Customization System
 * Provides utilities for managing custom themes
 */

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  card: string
  cardForeground: string
  border: string
  input: string
  ring: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeTypography {
  fontFamily: string
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    "2xl": string
    "3xl": string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

export interface ThemeSpacing {
  scale: number // Multiplier for spacing scale (e.g., 1.0 = default, 1.2 = 20% larger)
  containerPadding: string
  sectionGap: string
  cardPadding: string
}

export interface ThemeRadius {
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface CustomTheme {
  id: string
  name: string
  description?: string
  colors: Partial<ThemeColors>
  typography?: Partial<ThemeTypography>
  spacing?: Partial<ThemeSpacing>
  radius?: Partial<ThemeRadius>
  mode: "light" | "dark"
  createdAt?: string
  updatedAt?: string
}

// Default theme values
export const defaultThemeColors: ThemeColors = {
  primary: "hsl(222.2 47.4% 11.2%)",
  secondary: "hsl(210 40% 96.1%)",
  accent: "hsl(210 40% 96.1%)",
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222.2 47.4% 11.2%)",
  muted: "hsl(210 40% 96.1%)",
  mutedForeground: "hsl(215.4 16.3% 46.9%)",
  card: "hsl(0 0% 100%)",
  cardForeground: "hsl(222.2 47.4% 11.2%)",
  border: "hsl(214.3 31.8% 91.4%)",
  input: "hsl(214.3 31.8% 91.4%)",
  ring: "hsl(222.2 47.4% 11.2%)",
  success: "hsl(142.1 76.2% 36.3%)",
  warning: "hsl(38 92% 50%)",
  error: "hsl(0 84.2% 60.2%)",
  info: "hsl(199 89% 48%)",
}

export const defaultTypography: ThemeTypography = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const defaultSpacing: ThemeSpacing = {
  scale: 1.0,
  containerPadding: "1rem",
  sectionGap: "2rem",
  cardPadding: "1.5rem",
}

export const defaultRadius: ThemeRadius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
}

// Predefined theme presets
export const themePresets: CustomTheme[] = [
  {
    id: "default-light",
    name: "Default Light",
    description: "Clean and modern light theme",
    colors: defaultThemeColors,
    mode: "light",
  },
  {
    id: "default-dark",
    name: "Default Dark",
    description: "Comfortable dark theme",
    colors: {
      primary: "hsl(210 40% 98%)",
      secondary: "hsl(217.2 32.6% 17.5%)",
      accent: "hsl(217.2 32.6% 17.5%)",
      background: "hsl(222.2 84% 4.9%)",
      foreground: "hsl(210 40% 98%)",
      muted: "hsl(217.2 32.6% 17.5%)",
      mutedForeground: "hsl(215 20.2% 65.1%)",
      card: "hsl(222.2 84% 4.9%)",
      cardForeground: "hsl(210 40% 98%)",
      border: "hsl(217.2 32.6% 17.5%)",
      input: "hsl(217.2 32.6% 17.5%)",
      ring: "hsl(212.7 26.8% 83.9%)",
      success: "hsl(142.1 70.6% 45.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 72.2% 50.6%)",
      info: "hsl(199 89% 48%)",
    },
    mode: "dark",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue tones inspired by the sea",
    colors: {
      primary: "hsl(199 89% 48%)",
      secondary: "hsl(199 30% 90%)",
      accent: "hsl(187 85% 53%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(199 20% 15%)",
      muted: "hsl(199 30% 90%)",
      mutedForeground: "hsl(199 15% 45%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(199 20% 15%)",
      border: "hsl(199 30% 85%)",
      input: "hsl(199 30% 85%)",
      ring: "hsl(199 89% 48%)",
      success: "hsl(142.1 76.2% 36.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 84.2% 60.2%)",
      info: "hsl(199 89% 48%)",
    },
    mode: "light",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural green theme",
    colors: {
      primary: "hsl(142 52% 38%)",
      secondary: "hsl(142 30% 90%)",
      accent: "hsl(142 76% 36%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(142 20% 15%)",
      muted: "hsl(142 30% 90%)",
      mutedForeground: "hsl(142 15% 45%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(142 20% 15%)",
      border: "hsl(142 30% 85%)",
      input: "hsl(142 30% 85%)",
      ring: "hsl(142 52% 38%)",
      success: "hsl(142.1 76.2% 36.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 84.2% 60.2%)",
      info: "hsl(199 89% 48%)",
    },
    mode: "light",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and purple tones",
    colors: {
      primary: "hsl(280 60% 50%)",
      secondary: "hsl(280 30% 90%)",
      accent: "hsl(25 95% 53%)",
      background: "hsl(0 0% 100%)",
      foreground: "hsl(280 20% 15%)",
      muted: "hsl(280 30% 90%)",
      mutedForeground: "hsl(280 15% 45%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(280 20% 15%)",
      border: "hsl(280 30% 85%)",
      input: "hsl(280 30% 85%)",
      ring: "hsl(280 60% 50%)",
      success: "hsl(142.1 76.2% 36.3%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 84.2% 60.2%)",
      info: "hsl(199 89% 48%)",
    },
    mode: "light",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue dark theme",
    colors: {
      primary: "hsl(210 100% 70%)",
      secondary: "hsl(217 25% 20%)",
      accent: "hsl(210 100% 70%)",
      background: "hsl(220 30% 10%)",
      foreground: "hsl(210 40% 98%)",
      muted: "hsl(217 25% 20%)",
      mutedForeground: "hsl(215 20% 65%)",
      card: "hsl(220 30% 12%)",
      cardForeground: "hsl(210 40% 98%)",
      border: "hsl(217 25% 25%)",
      input: "hsl(217 25% 25%)",
      ring: "hsl(210 100% 70%)",
      success: "hsl(142 70% 45%)",
      warning: "hsl(38 92% 50%)",
      error: "hsl(0 72% 51%)",
      info: "hsl(199 89% 48%)",
    },
    mode: "dark",
  },
]

// Theme management utilities
export class ThemeManager {
  private static STORAGE_KEY = "custom-themes"
  private static ACTIVE_THEME_KEY = "active-theme-id"

  static getCustomThemes(): CustomTheme[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveCustomTheme(theme: CustomTheme): void {
    const themes = this.getCustomThemes()
    const existingIndex = themes.findIndex((t) => t.id === theme.id)

    const updatedTheme = {
      ...theme,
      updatedAt: new Date().toISOString(),
      createdAt: theme.createdAt || new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      themes[existingIndex] = updatedTheme
    } else {
      themes.push(updatedTheme)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(themes))
  }

  static deleteCustomTheme(themeId: string): void {
    const themes = this.getCustomThemes()
    const filtered = themes.filter((t) => t.id !== themeId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  static getAllThemes(): CustomTheme[] {
    return [...themePresets, ...this.getCustomThemes()]
  }

  static getThemeById(themeId: string): CustomTheme | undefined {
    return this.getAllThemes().find((t) => t.id === themeId)
  }

  static getActiveThemeId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.ACTIVE_THEME_KEY)
  }

  static setActiveTheme(themeId: string): void {
    localStorage.setItem(this.ACTIVE_THEME_KEY, themeId)
  }

  static applyTheme(theme: CustomTheme): void {
    if (typeof window === "undefined") return

    const root = document.documentElement

    // Apply colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (value) {
          const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
          root.style.setProperty(cssVar, value)
        }
      })
    }

    // Apply typography
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty("--font-family", theme.typography.fontFamily)
      }
      if (theme.typography.fontSize) {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--font-size-${key}`, value)
        })
      }
    }

    // Apply spacing
    if (theme.spacing) {
      if (theme.spacing.scale) {
        root.style.setProperty("--spacing-scale", theme.spacing.scale.toString())
      }
      if (theme.spacing.containerPadding) {
        root.style.setProperty("--container-padding", theme.spacing.containerPadding)
      }
    }

    // Apply radius
    if (theme.radius) {
      Object.entries(theme.radius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--radius-${key}`, value)
        }
      })
    }

    // Set theme mode
    root.classList.remove("light", "dark")
    root.classList.add(theme.mode)
  }

  static resetTheme(): void {
    if (typeof window === "undefined") return
    const root = document.documentElement
    
    // Remove all custom CSS variables
    const styles = root.style
    for (let i = styles.length - 1; i >= 0; i--) {
      const property = styles[i]
      if (property.startsWith("--")) {
        root.style.removeProperty(property)
      }
    }
  }

  static exportTheme(theme: CustomTheme): string {
    return JSON.stringify(theme, null, 2)
  }

  static importTheme(themeJson: string): CustomTheme {
    const theme = JSON.parse(themeJson) as CustomTheme
    // Validate theme structure
    if (!theme.id || !theme.name || !theme.mode) {
      throw new Error("Invalid theme format")
    }
    return theme
  }
}

// Color utilities
export function hslToRgb(hsl: string): { r: number; g: number; b: number } {
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/)
  if (!match) return { r: 0, g: 0, b: 0 }

  const h = parseFloat(match[1]) / 360
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

export function rgbToHsl(r: number, g: number, b: number): string {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`
}

export function adjustLightness(hsl: string, amount: number): string {
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/)
  if (!match) return hsl

  const h = parseFloat(match[1])
  const s = parseFloat(match[2])
  const l = Math.max(0, Math.min(100, parseFloat(match[3]) + amount))

  return `hsl(${h} ${s}% ${l}%)`
}

export function adjustSaturation(hsl: string, amount: number): string {
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/)
  if (!match) return hsl

  const h = parseFloat(match[1])
  const s = Math.max(0, Math.min(100, parseFloat(match[2]) + amount))
  const l = parseFloat(match[3])

  return `hsl(${h} ${s}% ${l}%)`
}
