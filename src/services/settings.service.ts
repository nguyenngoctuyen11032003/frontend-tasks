import { useAuthStore } from "@/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ==================== Types ====================
export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    border: string
    input: string
    ring: string
  }
  isDefault: boolean
  isCustom: boolean
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserSettings {
  id: string
  userId: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  theme: string
  emailNotifications: boolean
  pushNotifications: boolean
  soundEnabled: boolean
  taskReminders: boolean
  weekStartsOn: number
  createdAt: string
  updatedAt: string
}

export interface CreateThemeDto {
  name: string
  colors: Theme["colors"]
}

export interface UpdateThemeDto {
  name?: string
  colors?: Partial<Theme["colors"]>
}

export interface UpdateUserSettingsDto {
  language?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  theme?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  soundEnabled?: boolean
  taskReminders?: boolean
  weekStartsOn?: number
}

export interface SystemDefaults {
  defaultLanguage: string
  defaultTimezone: string
  defaultDateFormat: string
  defaultTimeFormat: string
  defaultTheme: string
  availableLanguages: string[]
  availableTimezones: string[]
  availableDateFormats: string[]
  availableTimeFormats: string[]
}

// ==================== Helper Functions ====================
const getAuthToken = () => {
  const { token } = useAuthStore.getState()
  if (!token) {
    throw new Error("Chưa đăng nhập. Vui lòng đăng nhập lại.")
  }
  return token
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    useAuthStore.getState().logout()
    throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// ==================== Settings API ====================
export class SettingsService {
  // ==================== Themes ====================
  
  /**
   * Create custom theme
   * POST /settings/themes
   */
  static async createTheme(data: CreateThemeDto): Promise<Theme> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<Theme>(response)
  }

  /**
   * Get all themes (default + user custom)
   * GET /settings/themes
   */
  static async getAllThemes(): Promise<Theme[]> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Theme[]>(response)
  }

  /**
   * Get default themes only
   * GET /settings/themes/defaults
   */
  static async getDefaultThemes(): Promise<Theme[]> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes/defaults`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Theme[]>(response)
  }

  /**
   * Get theme by ID
   * GET /settings/themes/:id
   */
  static async getTheme(id: string): Promise<Theme> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<Theme>(response)
  }

  /**
   * Update custom theme
   * PATCH /settings/themes/:id
   */
  static async updateTheme(id: string, data: UpdateThemeDto): Promise<Theme> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<Theme>(response)
  }

  /**
   * Delete custom theme
   * DELETE /settings/themes/:id
   */
  static async deleteTheme(id: string): Promise<void> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/themes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse<void>(response)
  }

  // ==================== User Settings ====================

  /**
   * Get current user settings
   * GET /settings/user
   */
  static async getUserSettings(): Promise<UserSettings> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<UserSettings>(response)
  }

  /**
   * Update user settings
   * PATCH /settings/user
   */
  static async updateUserSettings(data: UpdateUserSettingsDto): Promise<UserSettings> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/user`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse<UserSettings>(response)
  }

  /**
   * Reset user settings to defaults
   * POST /settings/user/reset
   */
  static async resetUserSettings(): Promise<UserSettings> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/user/reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<UserSettings>(response)
  }

  /**
   * Get system defaults
   * GET /settings/defaults
   */
  static async getSystemDefaults(): Promise<SystemDefaults> {
    const token = getAuthToken()

    const response = await fetch(`${API_BASE_URL}/settings/defaults`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return handleResponse<SystemDefaults>(response)
  }
}

// Export singleton instance
export const settingsService = SettingsService
