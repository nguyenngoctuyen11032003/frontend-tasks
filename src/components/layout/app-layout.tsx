"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { RightPanel } from "./right-panel"
import { KeyboardShortcutsPanel } from "./keyboard-shortcuts-panel"
import { GlobalKeyboardShortcuts } from "./global-keyboard-shortcuts"
import { SkipLink } from "@/components/ui/skip-link"
import { useUIStore } from "@/stores/ui-store"
import { useRouteAnnouncer } from "@/hooks/use-announce"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, rightPanelOpen } = useUIStore()
  const pathname = usePathname()
  const { announceRoute } = useRouteAnnouncer()

  useEffect(() => {
    // Announce route changes to screen readers
    const routeNames: Record<string, string> = {
      "/dashboard": "Tổng quan",
      "/tasks": "Công việc",
      "/projects": "Dự án",
      "/notes": "Ghi chú",
      "/chat": "Tin nhắn",
      "/team": "Nhóm",
      "/reports": "Báo cáo",
      "/settings": "Cài đặt",
      "/admin": "Quản trị",
    }

    const routeName = routeNames[pathname] || "Trang"
    announceRoute(routeName)
  }, [pathname, announceRoute])

  return (
    <div className="min-h-screen bg-background">
      <SkipLink href="#main-content">Bỏ qua đến nội dung chính</SkipLink>
      <Header />
      <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
        <Sidebar />
        <main
          id="main-content"
          role="main"
          aria-label="Nội dung chính"
          className={cn("flex-1 overflow-y-auto", "transition-all duration-200 ease-in-out")}
        >
          <div className="container mx-auto p-3 pb-20 sm:p-4 md:p-6 md:pb-6 max-w-full">{children}</div>
        </main>
        <RightPanel />
      </div>
      <MobileNav />
      <KeyboardShortcutsPanel />
      <GlobalKeyboardShortcuts />
    </div>
  )
}
