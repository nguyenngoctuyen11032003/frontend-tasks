/**
 * Accessibility utilities and helpers
 */

// Generate unique IDs for accessibility attributes
let idCounter = 0
export function generateId(prefix = "a11y"): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// Check if an element is focusable
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]

  return focusableSelectors.some((selector) => element.matches(selector))
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

// Focus the first focusable element in a container
export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container)
  if (elements.length > 0) {
    elements[0]?.focus()
  }
}

// Focus the last focusable element in a container
export function focusLastElement(container: HTMLElement): void {
  const elements = getFocusableElements(container)
  if (elements.length > 0) {
    elements[elements.length - 1]?.focus()
  }
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Check if user prefers high contrast
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-contrast: high)").matches
}

// Announce message to screen readers
export function announceToScreenReader(message: string, politeness: "polite" | "assertive" = "polite"): void {
  let announcer = document.getElementById("sr-announcer")

  if (!announcer) {
    announcer = document.createElement("div")
    announcer.id = "sr-announcer"
    announcer.setAttribute("role", "status")
    announcer.setAttribute("aria-live", politeness)
    announcer.setAttribute("aria-atomic", "true")
    announcer.className = "sr-only"
    announcer.style.cssText = "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"
    document.body.appendChild(announcer)
  }

  announcer.setAttribute("aria-live", politeness)
  announcer.textContent = ""

  setTimeout(() => {
    announcer!.textContent = message
  }, 100)

  setTimeout(() => {
    announcer!.textContent = ""
  }, 3100)
}

// Trap focus within a container
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return

  const focusableElements = getFocusableElements(container)
  if (focusableElements.length === 0) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

// ARIA labels for common actions
export const ariaLabels = {
  // Navigation
  mainNav: "Điều hướng chính",
  skipToContent: "Bỏ qua đến nội dung chính",
  skipToNav: "Bỏ qua đến điều hướng",
  
  // Actions
  close: "Đóng",
  open: "Mở",
  expand: "Mở rộng",
  collapse: "Thu gọn",
  delete: "Xóa",
  edit: "Chỉnh sửa",
  save: "Lưu",
  cancel: "Hủy",
  confirm: "Xác nhận",
  search: "Tìm kiếm",
  filter: "Lọc",
  sort: "Sắp xếp",
  
  // Status
  loading: "Đang tải",
  error: "Lỗi",
  success: "Thành công",
  warning: "Cảnh báo",
  info: "Thông tin",
  
  // Forms
  required: "Bắt buộc",
  optional: "Tùy chọn",
  invalid: "Không hợp lệ",
  
  // Menu
  menu: "Menu",
  submenu: "Menu con",
  menuOpen: "Mở menu",
  menuClose: "Đóng menu",
  
  // Notifications
  notifications: "Thông báo",
  newNotification: "Thông báo mới",
  noNotifications: "Không có thông báo",
  
  // User
  userMenu: "Menu người dùng",
  profile: "Hồ sơ cá nhân",
  settings: "Cài đặt",
  logout: "Đăng xuất",
} as const

// Helper to get ARIA description for form validation
export function getAriaDescribedBy(
  fieldId: string,
  options: {
    hasError?: boolean
    hasHelp?: boolean
  } = {}
): string | undefined {
  const ids: string[] = []
  
  if (options.hasError) {
    ids.push(`${fieldId}-error`)
  }
  
  if (options.hasHelp) {
    ids.push(`${fieldId}-help`)
  }
  
  return ids.length > 0 ? ids.join(" ") : undefined
}

// Helper to get ARIA label with required indicator
export function getAriaLabel(label: string, required?: boolean): string {
  return required ? `${label} (${ariaLabels.required})` : label
}
