"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageCircle,
  Menu,
  X,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePermission } from "@/hooks/use-permission"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/projects", label: "Dự án", icon: FolderKanban },
  { href: "/tasks", label: "Công việc", icon: CheckSquare, badge: 5 },
  { href: "/chat", label: "Tin nhắn", icon: MessageCircle, badge: 3 },
]

const menuItems = [
  { href: "/notes", label: "Ghi chú", icon: FileText },
  { href: "/team", label: "Nhóm", icon: Users },
  { href: "/reports", label: "Báo cáo", icon: BarChart3, permission: "reports.view" },
  { href: "/settings", label: "Cài đặt", icon: Settings },
  { href: "/admin", label: "Quản trị", icon: Shield, permission: "users.manage" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { can, isAdmin } = usePermission()

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true
    if (item.href === "/admin") return isAdmin()
    return can(item.permission as any)
  })

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden" role="navigation" aria-label="Điều hướng di động">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 py-3 min-h-[64px] justify-center text-xs transition-colors touch-target",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            )
          })}
          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-3 min-h-[64px] justify-center text-xs transition-colors touch-target",
              menuOpen ? "text-primary" : "text-muted-foreground",
            )}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
              role="button"
              aria-label="Đóng menu"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t bg-background p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Menu</h3>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {filteredMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors min-h-[88px] justify-center touch-target-comfortable",
                        isActive ? "bg-primary/10 text-primary" : "bg-muted/50 hover:bg-muted",
                      )}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
