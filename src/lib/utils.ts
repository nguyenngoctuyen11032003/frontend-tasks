import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Quá hạn ${Math.abs(diffDays)} ngày`
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "Ngày mai"
  if (diffDays <= 7) return `Còn ${diffDays} ngày`
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}
