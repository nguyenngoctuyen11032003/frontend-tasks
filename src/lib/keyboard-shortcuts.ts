export const keyboardShortcuts = {
  // Navigation
  navigation: {
    dashboard: { keys: ["g", "d"], description: "Đi tới Dashboard" },
    tasks: { keys: ["g", "t"], description: "Đi tới Công việc" },
    projects: { keys: ["g", "p"], description: "Đi tới Dự án" },
    notes: { keys: ["g", "n"], description: "Đi tới Ghi chú" },
    chat: { keys: ["g", "c"], description: "Đi tới Chat" },
    team: { keys: ["g", "m"], description: "Đi tới Nhóm" },
    settings: { keys: ["g", "s"], description: "Đi tới Cài đặt" },
  },

  // Actions
  actions: {
    commandPalette: { keys: ["ctrl", "k"], description: "Mở Command Palette" },
    search: { keys: ["/"], description: "Tìm kiếm" },
    shortcuts: { keys: ["?"], description: "Hiện phím tắt" },
    escape: { keys: ["esc"], description: "Đóng dialog/panel" },
    new: { keys: ["n"], description: "Tạo mới" },
  },

  // Task Management
  tasks: {
    create: { keys: ["c"], description: "Tạo công việc mới" },
    edit: { keys: ["e"], description: "Chỉnh sửa công việc" },
    delete: { keys: ["d"], description: "Xóa công việc" },
    assign: { keys: ["a"], description: "Giao công việc" },
    move: { keys: ["m"], description: "Di chuyển công việc" },
  },

  // View Controls
  views: {
    kanban: { keys: ["v", "k"], description: "Chế độ Kanban" },
    list: { keys: ["v", "l"], description: "Chế độ List" },
    calendar: { keys: ["v", "c"], description: "Chế độ Calendar" },
    theme: { keys: ["t"], description: "Chuyển theme" },
  },

  // Editor
  editor: {
    bold: { keys: ["ctrl", "b"], description: "In đậm" },
    italic: { keys: ["ctrl", "i"], description: "In nghiêng" },
    underline: { keys: ["ctrl", "u"], description: "Gạch chân" },
    save: { keys: ["ctrl", "s"], description: "Lưu" },
    undo: { keys: ["ctrl", "z"], description: "Hoàn tác" },
    redo: { keys: ["ctrl", "shift", "z"], description: "Làm lại" },
  },

  // General
  general: {
    print: { keys: ["ctrl", "p"], description: "In trang" },
    settings: { keys: ["ctrl", ","], description: "Mở Cài đặt" },
    help: { keys: ["shift", "?"], description: "Trợ giúp" },
  },
} as const;

export type ShortcutCategory = keyof typeof keyboardShortcuts;
export type ShortcutKey<T extends ShortcutCategory> =
  keyof (typeof keyboardShortcuts)[T];
