"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  FileText,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUIStore } from "@/stores/ui-store"
import { usePermission } from "@/hooks/use-permission"
import { cn } from "@/lib/utils"
import type { Permission } from "@/types"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
  permission?: Permission
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/projects", label: "Dự án", icon: FolderKanban },
  { href: "/tasks", label: "Công việc", icon: CheckSquare, badge: 5 },
  { href: "/notes", label: "Ghi chú", icon: FileText },
  { href: "/team", label: "Nhóm", icon: Users, permission: "team.view" },
  { href: "/chat", label: "Tin nhắn", icon: MessageCircle, badge: 3 },
  { href: "/reports", label: "Báo cáo", icon: BarChart3, permission: "reports.view" },
  { href: "/settings", label: "Cài đặt", icon: Settings },
  { href: "/admin", label: "Quản trị", icon: Shield, permission: "users.manage" },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { can, isAdmin } = usePermission()

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true
    if (item.href === "/admin") return isAdmin()
    return can(item.permission)
  })

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "relative hidden h-[calc(100vh-3.5rem)] flex-shrink-0 border-r bg-sidebar md:block md:h-[calc(100vh-4rem)]",
          className,
        )}
        aria-label="Điều hướng chính"
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3" role="navigation" aria-label="Menu chính">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                >
                  <Icon 
                    className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} 
                    aria-hidden="true"
                    suppressHydrationWarning 
                  />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 truncate"
                        suppressHydrationWarning
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && !sidebarCollapsed && (
                    <Badge variant="secondary" className="ml-auto flex h-5 w-5 items-center justify-center p-0 text-xs" aria-label={`${item.badge} mới`}>
                      {item.badge}
                    </Badge>
                  )}
                  {item.badge && sidebarCollapsed && (
                    <span className="absolute right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground" aria-label={`${item.badge} mới`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <div className="relative">{linkContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.href}>{linkContent}</div>
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-center"
              aria-label={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                  <span>Thu gọn</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
