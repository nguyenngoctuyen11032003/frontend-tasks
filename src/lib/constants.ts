/**
 * Application Constants
 * Contains permission labels and other static data
 * Note: Permissions are also defined in types/index.ts
 */

import type { Permission } from "@/types"

// Permission Labels for UI Display (Re-exported from types for compatibility)
export const PERMISSION_LABELS: Record<Permission, string> = {
  // Projects
  "projects.view": "Xem dự án",
  "projects.create": "Tạo dự án",
  "projects.update": "Cập nhật dự án",
  "projects.delete": "Xóa dự án",

  // Tasks
  "tasks.view": "Xem công việc",
  "tasks.create": "Tạo công việc",
  "tasks.update": "Cập nhật công việc",
  "tasks.delete": "Xóa công việc",
  "tasks.assign": "Phân công công việc",
  "tasks.complete": "Hoàn thành công việc",

  // Users
  "users.view": "Xem người dùng",
  "users.manage": "Quản lý người dùng",
  "users.invite": "Mời người dùng",

  // Roles
  "roles.view": "Xem vai trò",
  "roles.create": "Tạo vai trò",
  "roles.manage": "Quản lý vai trò",
  "roles.delete": "Xóa vai trò",

  // Settings
  "settings.view": "Xem cài đặt",
  "settings.manage": "Quản lý cài đặt",

  // Reports
  "reports.view": "Xem báo cáo",
  "reports.create": "Tạo báo cáo",
  "reports.export": "Xuất báo cáo",

  // Notes
  "notes.view": "Xem ghi chú",
  "notes.create": "Tạo ghi chú",
  "notes.update": "Cập nhật ghi chú",
  "notes.delete": "Xóa ghi chú",

  // Chat
  "chat.create": "Tạo chat",
  "chat.send": "Gửi tin nhắn",
  "chat.delete": "Xóa tin nhắn",

  // Team
  "team.view": "Xem nhóm",
  "team.manage": "Quản lý nhóm",
}
