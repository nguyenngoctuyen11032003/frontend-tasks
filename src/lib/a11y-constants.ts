/**
 * Focus visible styles for keyboard navigation
 * Applies consistent focus ring across all interactive elements
 */

export const focusVisibleStyles = {
  // Base focus visible ring
  ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  
  // Focus visible for buttons
  button: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  
  // Focus visible for inputs
  input: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  
  // Focus visible for links
  link: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm",
  
  // Focus visible for interactive cards
  card: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  
  // Focus visible for menu items
  menuItem: "focus-visible:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
  
  // Skip focus visible (for decorative elements)
  none: "focus-visible:outline-none",
} as const

/**
 * WCAG color contrast ratios
 * Minimum contrast ratios for text and UI components
 */
export const contrastRatios = {
  // WCAG AA requirements
  normalText: 4.5, // Normal text (< 18pt regular, < 14pt bold)
  largeText: 3, // Large text (>= 18pt regular, >= 14pt bold)
  uiComponents: 3, // Graphical objects and UI components
  
  // WCAG AAA requirements
  normalTextEnhanced: 7,
  largeTextEnhanced: 4.5,
} as const

/**
 * Minimum touch target sizes (WCAG 2.5.5)
 */
export const touchTargetSizes = {
  minimum: 44, // 44x44px minimum touch target
  comfortable: 48, // 48x48px comfortable touch target
  spacing: 8, // Minimum spacing between touch targets
} as const

/**
 * Animation duration preferences
 */
export const animationDurations = {
  // Reduced motion
  reducedMotion: {
    fast: 0,
    normal: 0,
    slow: 0,
  },
  
  // Normal motion
  normal: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
} as const

/**
 * Screen reader only styles
 */
export const srOnlyStyles = {
  base: "absolute w-px h-px p-0 m-[-1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0",
  
  // For focusable elements (like skip links)
  focusable: "absolute w-px h-px p-0 m-[-1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0 focus:not-sr-only focus:absolute focus:w-auto focus:h-auto focus:p-4 focus:m-0 focus:overflow-visible focus:clip-auto focus:whitespace-normal",
} as const

/**
 * Common ARIA patterns
 */
export const ariaPatterns = {
  // Required field indicator
  required: (fieldName: string) => `${fieldName} (bắt buộc)`,
  
  // Error message
  error: (fieldName: string, message: string) => `Lỗi trong ${fieldName}: ${message}`,
  
  // Loading state
  loading: (action: string) => `Đang ${action}...`,
  
  // Success state
  success: (action: string) => `${action} thành công`,
  
  // Pagination
  pagination: (current: number, total: number) => `Trang ${current} / ${total}`,
  
  // List items
  listItem: (current: number, total: number) => `Mục ${current} / ${total}`,
  
  // Menu
  menuExpanded: "Menu đã mở",
  menuCollapsed: "Menu đã đóng",
  
  // Tabs
  tabSelected: (tabName: string) => `${tabName} đã chọn`,
  
  // Sort
  sortAscending: (column: string) => `${column} sắp xếp tăng dần`,
  sortDescending: (column: string) => `${column} sắp xếp giảm dần`,
} as const

/**
 * Keyboard navigation helpers
 */
export const keyboardHelpers = {
  // Arrow keys
  isArrowKey: (key: string) => ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key),
  
  // Navigation keys
  isNavigationKey: (key: string) => ["Home", "End", "PageUp", "PageDown"].includes(key),
  
  // Action keys
  isActionKey: (key: string) => ["Enter", " ", "Space"].includes(key),
  
  // Modifier keys
  hasModifier: (event: KeyboardEvent) => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey,
} as const
